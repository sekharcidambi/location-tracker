"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import type { LocationData } from "@/lib/location-store"

type LocationMapProps = {
  currentLocation: LocationData
  locationHistory: LocationData[]
  formatTime: (timestamp: number) => string
}

export default function LocationMap({ currentLocation, locationHistory, formatTime }: LocationMapProps) {
  // Fix for Leaflet map container not being available during SSR
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fix Leaflet default icon issue
  useEffect(() => {
    // Only run this on the client side
    if (typeof window !== "undefined") {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
    }
  }, [])

  if (!isMounted) {
    return <div className="h-full w-full flex items-center justify-center bg-muted">Loading map...</div>
  }

  // Create path coordinates for the polyline
  const pathPositions = locationHistory.map((loc) => [loc.latitude, loc.longitude]) as [number, number][]

  return (
    <MapContainer
      center={[currentLocation.latitude, currentLocation.longitude]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Current location marker */}
      <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
        <Popup>
          Current Location
          <br />
          {formatTime(currentLocation.timestamp)}
        </Popup>
      </Marker>

      {/* Show history points on map */}
      {locationHistory.slice(0, -1).map((loc, index) => (
        <Marker key={index} position={[loc.latitude, loc.longitude]} opacity={0.6}>
          <Popup>
            Previous Location
            <br />
            {formatTime(loc.timestamp)}
          </Popup>
        </Marker>
      ))}

      {/* Show path as a polyline */}
      {pathPositions.length > 1 && <Polyline positions={pathPositions} color="blue" weight={3} opacity={0.7} />}
    </MapContainer>
  )
}
