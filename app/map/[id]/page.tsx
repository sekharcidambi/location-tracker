"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, MapPin, RefreshCw, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"
import NavBar from "@/components/nav-bar"
import { type LocationData, getLocations, formatTime, formatDate } from "@/lib/location-store"

// Dynamically import the Map component with no SSR
const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-muted">
      <p>Loading map...</p>
    </div>
  ),
})

export default function MapView() {
  const params = useParams()
  const trackingId = params.id as string

  const [locations, setLocations] = useState<LocationData[]>([])
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load locations from localStorage
  const loadLocations = () => {
    setLoading(true)
    const loadedLocations = getLocations(trackingId)
    setLocations(loadedLocations)

    if (loadedLocations.length > 0) {
      setCurrentLocation(loadedLocations[loadedLocations.length - 1])
    }

    setLastUpdated(new Date())
    setLoading(false)
  }

  // Load locations on mount and when trackingId changes
  useEffect(() => {
    if (trackingId) {
      loadLocations()

      // Set up polling to refresh data
      const interval = setInterval(() => {
        loadLocations()
      }, 10000) // Check for updates every 10 seconds

      return () => clearInterval(interval)
    }
  }, [trackingId])

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Location Map
            </CardTitle>
            <CardDescription>Viewing shared location for tracking ID: {trackingId}</CardDescription>
          </CardHeader>
          <CardContent>
            {lastUpdated && (
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</div>
                <Button variant="outline" size="sm" onClick={loadLocations}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
              </div>
            )}

            {locations.length === 0 ? (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>No locations found</AlertTitle>
                <AlertDescription>
                  No location data is available for this tracking ID. The user may not have started tracking yet.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-sm mb-4">
                <p>
                  <strong>Locations tracked:</strong> {locations.length}
                </p>
                {currentLocation && (
                  <>
                    <p>
                      <strong>Latest location:</strong> {currentLocation.latitude.toFixed(6)},{" "}
                      {currentLocation.longitude.toFixed(6)}
                    </p>
                    <p>
                      <strong>Last updated:</strong> {formatTime(currentLocation.timestamp)} on{" "}
                      {formatDate(currentLocation.timestamp)}
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {currentLocation && (
          <Tabs defaultValue="map" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">
                <MapPin className="mr-2 h-4 w-4" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                Location History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <Card>
                <CardContent className="p-0 overflow-hidden rounded-md">
                  <div className="h-[500px] w-full">
                    <LocationMap
                      currentLocation={currentLocation}
                      locationHistory={locations}
                      formatTime={formatTime}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Location History</CardTitle>
                  <CardDescription>{locations.length} locations recorded</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {locations.length > 0 ? (
                      <div className="space-y-4">
                        {[...locations].reverse().map((loc, index) => (
                          <div key={index} className="border-b pb-2 last:border-0">
                            <div className="flex justify-between">
                              <span className="font-medium">Location {locations.length - index}</span>
                              <span className="text-sm text-muted-foreground">{formatTime(loc.timestamp)}</span>
                            </div>
                            <div className="text-sm">
                              <p>Latitude: {loc.latitude.toFixed(6)}</p>
                              <p>Longitude: {loc.longitude.toFixed(6)}</p>
                              {loc.accuracy && <p>Accuracy: {loc.accuracy.toFixed(2)} meters</p>}
                              <p>Date: {formatDate(loc.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No location history available</div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!currentLocation && (
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-md">
              <div className="h-[500px] w-full flex items-center justify-center bg-muted">
                <p>No location data available.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
