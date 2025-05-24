"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Play, Square, Navigation, Clock, Gauge, Share2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { UrlShortener } from "@/lib/url-shortener"
import LocationMap from "@/components/location-map"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  speed?: number | null
  heading?: number | null
}

interface TrackingSession {
  id: string
  name: string
  isActive: boolean
  currentLocation: LocationData | null
  locationHistory: LocationData[]
  createdAt: number
}

export default function LocationTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<string>("prompt")
  const [sessionId, setSessionId] = useState<string>("")
  const [sessionName, setSessionName] = useState<string>("")
  const [shareableLink, setShareableLink] = useState<string>("")
  const watchIdRef = useRef<number | null>(null)

  // Generate session ID on component mount
  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 15)
    setSessionId(id)
    setSessionName(`Location Session ${new Date().toLocaleDateString()}`)
  }, [])

  // Check geolocation support and permission
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionStatus(result.state)
      })
    }
  }, [])

  // Update session data in localStorage whenever location changes
  useEffect(() => {
    if (sessionId) {
      const sessionData: TrackingSession = {
        id: sessionId,
        name: sessionName,
        isActive: isTracking,
        currentLocation,
        locationHistory,
        createdAt: Date.now(),
      }

      localStorage.setItem(`location_session_${sessionId}`, JSON.stringify(sessionData))

      // Also update the list of active sessions
      const activeSessions = JSON.parse(localStorage.getItem("active_sessions") || "[]")
      const existingIndex = activeSessions.findIndex((s: any) => s.id === sessionId)

      if (existingIndex >= 0) {
        activeSessions[existingIndex] = { id: sessionId, name: sessionName, isActive: isTracking }
      } else {
        activeSessions.push({ id: sessionId, name: sessionName, isActive: isTracking })
      }

      localStorage.setItem("active_sessions", JSON.stringify(activeSessions))
    }
  }, [sessionId, sessionName, isTracking, currentLocation, locationHistory])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported")
      return
    }

    setError(null)
    setIsTracking(true)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          speed: position.coords.speed,
          heading: position.coords.heading,
        }
        setCurrentLocation(locationData)
        setLocationHistory((prev) => [...prev, locationData])
      },
      (error) => {
        setError(`Error getting location: ${error.message}`)
        setIsTracking(false)
      },
      options,
    )

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          speed: position.coords.speed,
          heading: position.coords.heading,
        }
        setCurrentLocation(locationData)
        setLocationHistory((prev) => [...prev, locationData])
      },
      (error) => {
        setError(`Error watching location: ${error.message}`)
        setIsTracking(false)
      },
      options,
    )

    // Generate shareable link with URL shortener
    const fullLink = `${window.location.origin}/map/${sessionId}`
    const shortCode = UrlShortener.createShortUrl(fullLink, sessionId)
    const shortLink = `${window.location.origin}/s/${shortCode}`
    setShareableLink(shortLink)
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }

  const clearHistory = () => {
    setLocationHistory([])
    setCurrentLocation(null)
  }

  const copyShareableLink = async () => {
    if (shareableLink) {
      try {
        await navigator.clipboard.writeText(shareableLink)
        // You could add a toast notification here
      } catch (err) {
        console.error("Failed to copy link:", err)
      }
    }
  }

  const formatCoordinate = (coord: number, isLatitude: boolean) => {
    const direction = isLatitude ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W"
    return `${Math.abs(coord).toFixed(6)}° ${direction}`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c * 1000
  }

  const totalDistance =
    locationHistory.length > 1
      ? locationHistory.reduce((total, location, index) => {
          if (index === 0) return 0
          const prev = locationHistory[index - 1]
          return total + calculateDistance(prev.latitude, prev.longitude, location.latitude, location.longitude)
        }, 0)
      : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <MapPin className="h-8 w-8" />
          Location Tracker
        </h1>
        <p className="text-muted-foreground">Track your location and share it with others</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Session Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
          <CardDescription>Configure your tracking session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter session name"
            />
          </div>
          <div className="space-y-2">
            <Label>Session ID</Label>
            <Input value={sessionId} readOnly className="font-mono text-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button onClick={startTracking} disabled={isTracking} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Start Tracking
        </Button>
        <Button onClick={stopTracking} disabled={!isTracking} variant="outline" className="flex items-center gap-2">
          <Square className="h-4 w-4" />
          Stop Tracking
        </Button>
        <Button onClick={clearHistory} variant="outline" disabled={locationHistory.length === 0}>
          Clear History
        </Button>
      </div>

      {/* Shareable Link */}
      {shareableLink && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Location
            </CardTitle>
            <CardDescription>Others can view your location using this short link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Short Link (Recommended)</Label>
              <div className="flex gap-2">
                <Input value={shareableLink} readOnly className="font-mono text-sm" />
                <Button onClick={copyShareableLink} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Direct Link</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/map/${sessionId}`}
                  readOnly
                  className="font-mono text-sm text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/map/${sessionId}`} target="_blank">
                <Button variant="outline" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  View Map
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Current Location
            </CardTitle>
            <CardDescription>
              <Badge variant={isTracking ? "default" : "secondary"}>
                {isTracking ? "Tracking Active" : "Tracking Stopped"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentLocation ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Latitude</p>
                  <p className="font-mono">{formatCoordinate(currentLocation.latitude, true)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longitude</p>
                  <p className="font-mono">{formatCoordinate(currentLocation.longitude, false)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="font-mono">{currentLocation.accuracy.toFixed(1)}m</p>
                </div>
                {currentLocation.speed !== null && currentLocation.speed !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Speed</p>
                    <p className="font-mono">{(currentLocation.speed * 3.6).toFixed(1)} km/h</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No location data available</p>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">{locationHistory.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Distance</p>
              <p className="text-2xl font-bold">{totalDistance.toFixed(1)}m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Permission Status</p>
              <Badge variant={permissionStatus === "granted" ? "default" : "secondary"}>{permissionStatus}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Map Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Map Preview</CardTitle>
            <CardDescription>Current location overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square">
              <LocationMap
                currentLocation={currentLocation}
                locationHistory={locationHistory.slice(-5)}
                isLive={isTracking}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location History */}
      {locationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Location History
            </CardTitle>
            <CardDescription>Recent location updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {locationHistory
                .slice(-10)
                .reverse()
                .map((location, index) => (
                  <div key={location.timestamp} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <div className="space-y-1">
                      <p className="text-sm font-mono">
                        {formatCoordinate(location.latitude, true)}, {formatCoordinate(location.longitude, false)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Accuracy: {location.accuracy.toFixed(1)}m
                        {location.speed && ` • Speed: ${(location.speed * 3.6).toFixed(1)} km/h`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatTime(location.timestamp)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
