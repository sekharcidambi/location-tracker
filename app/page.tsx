"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { type LocationData, generateTrackingId, saveLocations, formatTime } from "@/lib/location-store"
import NavBar from "@/components/nav-bar"
import { Input } from "@/components/ui/input"

export default function LocationTracker() {
  const [trackingId, setTrackingId] = useState<string>("")
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null)
  const [shareUrl, setShareUrl] = useState<string>("")
  const { toast } = useToast()

  // Initialize tracking ID
  useEffect(() => {
    const newTrackingId = generateTrackingId()
    setTrackingId(newTrackingId)
  }, [])

  // Update share URL when tracking ID changes
  useEffect(() => {
    if (trackingId && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/map/${trackingId}`)
    }
  }, [trackingId])

  // Get current location
  const getCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }

        setCurrentLocation(newLocation)

        // Update location history
        const updatedHistory = [...locationHistory, newLocation]
        setLocationHistory(updatedHistory)

        // Save to localStorage
        if (trackingId) {
          saveLocations(trackingId, updatedHistory)
        }

        setError(null)
      },
      (error) => {
        setError(`Error getting location: ${error.message}`)
        setIsTracking(false)
        if (trackingInterval) clearInterval(trackingInterval)
      },
    )
  }

  // Start tracking
  const startTracking = () => {
    getCurrentLocation() // Get location immediately

    // Then set up interval
    const interval = setInterval(() => {
      getCurrentLocation()
    }, 10000) // Update every 10 seconds

    setTrackingInterval(interval)
    setIsTracking(true)
  }

  // Stop tracking
  const stopTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval)
      setTrackingInterval(null)
    }
    setIsTracking(false)
  }

  // Clear history
  const clearHistory = () => {
    setLocationHistory([])
    if (trackingId) {
      saveLocations(trackingId, [])
    }
  }

  // Copy share URL to clipboard
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied!",
      description: "Share this link with others to let them view your location.",
    })
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) clearInterval(trackingInterval)
    }
  }, [trackingInterval])

  return (
    <>
      <NavBar trackingId={trackingId} />
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-6 w-6" />
              Location Tracker
            </CardTitle>
            <CardDescription>Track your location and share it with others</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {!isTracking ? (
                  <Button onClick={startTracking} className="bg-green-600 hover:bg-green-700">
                    Start Tracking
                  </Button>
                ) : (
                  <Button onClick={stopTracking} variant="destructive">
                    Stop Tracking
                  </Button>
                )}
                <Button onClick={getCurrentLocation} variant="outline">
                  Get Current Location
                </Button>
                <Button onClick={clearHistory} variant="outline" className="ml-auto">
                  Clear History
                </Button>
              </div>

              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

              {currentLocation && (
                <div className="text-sm">
                  <p>
                    <strong>Current Location:</strong> {currentLocation.latitude.toFixed(6)},{" "}
                    {currentLocation.longitude.toFixed(6)}
                  </p>
                  <p>
                    <strong>Accuracy:</strong> {currentLocation.accuracy?.toFixed(2)} meters
                  </p>
                  <p>
                    <strong>Last Updated:</strong> {formatTime(currentLocation.timestamp)}
                  </p>
                </div>
              )}

              {locationHistory.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium">Share Your Location</h3>
                    <Button size="sm" variant="outline" onClick={copyShareUrl}>
                      <Share2 className="h-4 w-4 mr-1" /> Copy Link
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="flex-1" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share this link with others to let them view your location on a map
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
