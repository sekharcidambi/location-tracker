"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation, Clock, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useParams } from "next/navigation"
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

export default function MapViewer() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<TrackingSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  const loadSession = () => {
    try {
      const sessionData = localStorage.getItem(`location_session_${sessionId}`)
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData)
        setSession(parsedSession)
        setLastUpdate(Date.now())
        setError(null)
      } else {
        setError("Session not found. Make sure the tracker is running and the link is correct.")
      }
    } catch (err) {
      setError("Error loading session data")
    }
  }

  useEffect(() => {
    loadSession()

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadSession, 5000)

    return () => clearInterval(interval)
  }, [sessionId])

  const formatCoordinate = (coord: number, isLatitude: boolean) => {
    const direction = isLatitude ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W"
    return `${Math.abs(coord).toFixed(6)}° ${direction}`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`
    }
    return `${seconds}s ago`
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
    session && session.locationHistory.length > 1
      ? session.locationHistory.reduce((total, location, index) => {
          if (index === 0) return 0
          const prev = session.locationHistory[index - 1]
          return total + calculateDistance(prev.latitude, prev.longitude, location.latitude, location.longitude)
        }, 0)
      : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Location Viewer
          </h1>
          <p className="text-muted-foreground">{session ? `Viewing: ${session.name}` : `Session ID: ${sessionId}`}</p>
        </div>
        <Button onClick={loadSession} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {session && (
        <>
          <div className="text-center">
            <Badge variant={session.isActive ? "default" : "secondary"} className="text-sm">
              {session.isActive ? "Live Tracking" : "Tracking Stopped"}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {formatRelativeTime(lastUpdate)}</p>
          </div>

          {/* Map Display */}
          <Card>
            <CardHeader>
              <CardTitle>Live Location Map</CardTitle>
              <CardDescription>Real-time location display</CardDescription>
            </CardHeader>
            <CardContent>
              <LocationMap
                currentLocation={session.currentLocation}
                locationHistory={session.locationHistory}
                isLive={session.isActive}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {session.currentLocation ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Latitude</p>
                      <p className="font-mono">{formatCoordinate(session.currentLocation.latitude, true)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Longitude</p>
                      <p className="font-mono">{formatCoordinate(session.currentLocation.longitude, false)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="font-mono">±{session.currentLocation.accuracy.toFixed(1)}m</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Update</p>
                      <p className="font-mono">{formatTime(session.currentLocation.timestamp)}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No location data available</p>
                )}
              </CardContent>
            </Card>

            {/* Session Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{session.locationHistory.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance Traveled</p>
                  <p className="text-2xl font-bold">{totalDistance.toFixed(1)}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session Started</p>
                  <p className="text-sm">{new Date(session.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={session.isActive ? "default" : "secondary"}>
                    {session.isActive ? "Active" : "Stopped"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Location History */}
          {session.locationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>Latest location points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {session.locationHistory
                    .slice(-5)
                    .reverse()
                    .map((location, index) => (
                      <div
                        key={location.timestamp}
                        className="flex justify-between items-center p-2 bg-muted/50 rounded"
                      >
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
                          <p className="text-xs text-muted-foreground">{formatRelativeTime(location.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
