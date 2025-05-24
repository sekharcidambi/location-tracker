"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  speed?: number | null
  heading?: number | null
}

interface LocationMapProps {
  currentLocation: LocationData | null
  locationHistory: LocationData[]
  isLive?: boolean
}

export default function LocationMap({ currentLocation, locationHistory, isLive = false }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const pathRef = useRef<any>(null)
  const accuracyCircleRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return

      // Dynamically import Leaflet
      const L = (await import("leaflet")).default

      // Import CSS
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      // Initialize map
      if (!mapInstanceRef.current) {
        const defaultLat = currentLocation?.latitude || 40.7128
        const defaultLng = currentLocation?.longitude || -74.006

        mapInstanceRef.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 15)

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current)
      }
    }

    initMap()

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const updateMap = async () => {
      if (!mapInstanceRef.current || !currentLocation) return

      const L = (await import("leaflet")).default

      // Clear existing markers and paths
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      if (pathRef.current) {
        pathRef.current.remove()
        pathRef.current = null
      }
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove()
        accuracyCircleRef.current = null
      }

      // Create custom icons
      const currentLocationIcon = L.divIcon({
        html: `
          <div style="
            width: 20px; 
            height: 20px; 
            background: #3b82f6; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            position: relative;
          ">
            ${
              isLive
                ? `<div style="
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    width: 26px;
                    height: 26px;
                    background: #3b82f6;
                    border-radius: 50%;
                    opacity: 0.3;
                    animation: pulse 2s infinite;
                  "></div>`
                : ""
            }
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.5); opacity: 0.1; }
              100% { transform: scale(2); opacity: 0; }
            }
          </style>
        `,
        className: "custom-location-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const historyIcon = L.divIcon({
        html: `
          <div style="
            width: 8px; 
            height: 8px; 
            background: #6b7280; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          "></div>
        `,
        className: "custom-history-marker",
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      })

      // Add accuracy circle
      if (currentLocation.accuracy) {
        accuracyCircleRef.current = L.circle([currentLocation.latitude, currentLocation.longitude], {
          radius: currentLocation.accuracy,
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          color: "#3b82f6",
          weight: 1,
          opacity: 0.3,
        }).addTo(mapInstanceRef.current)
      }

      // Add path if there's history
      if (locationHistory.length > 1) {
        const pathCoords = locationHistory.map((loc) => [loc.latitude, loc.longitude])
        pathRef.current = L.polyline(pathCoords, {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.7,
          smoothFactor: 1,
        }).addTo(mapInstanceRef.current)

        // Add history markers (show last 10 points)
        const recentHistory = locationHistory.slice(-10, -1) // Exclude current location
        recentHistory.forEach((location, index) => {
          const marker = L.marker([location.latitude, location.longitude], {
            icon: historyIcon,
          })
            .addTo(mapInstanceRef.current)
            .bindPopup(
              `
              <div style="font-size: 12px;">
                <strong>Historical Point</strong><br/>
                <strong>Time:</strong> ${new Date(location.timestamp).toLocaleTimeString()}<br/>
                <strong>Accuracy:</strong> ±${location.accuracy.toFixed(1)}m
                ${location.speed ? `<br/><strong>Speed:</strong> ${(location.speed * 3.6).toFixed(1)} km/h` : ""}
              </div>
            `,
              { closeButton: false },
            )

          markersRef.current.push(marker)
        })
      }

      // Add current location marker
      const currentMarker = L.marker([currentLocation.latitude, currentLocation.longitude], {
        icon: currentLocationIcon,
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `
          <div style="font-size: 12px;">
            <strong>${isLive ? "🔴 Live Location" : "Current Location"}</strong><br/>
            <strong>Lat:</strong> ${currentLocation.latitude.toFixed(6)}<br/>
            <strong>Lng:</strong> ${currentLocation.longitude.toFixed(6)}<br/>
            <strong>Accuracy:</strong> ±${currentLocation.accuracy.toFixed(1)}m<br/>
            <strong>Time:</strong> ${new Date(currentLocation.timestamp).toLocaleTimeString()}
            ${currentLocation.speed ? `<br/><strong>Speed:</strong> ${(currentLocation.speed * 3.6).toFixed(1)} km/h` : ""}
          </div>
        `,
          { closeButton: false },
        )

      markersRef.current.push(currentMarker)

      // Center map on current location
      mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 16)

      // If there's a path, fit the map to show all points
      if (pathRef.current) {
        const group = L.featureGroup([pathRef.current, ...markersRef.current])
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] })
      }
    }

    updateMap()
  }, [currentLocation, locationHistory, isLive])

  if (!currentLocation) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No location data available</p>
          <p className="text-sm text-muted-foreground">Waiting for location updates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="aspect-video rounded-lg border" style={{ minHeight: "400px" }} />
      {isLive && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
        Accuracy: ±{currentLocation.accuracy.toFixed(1)}m
      </div>
    </div>
  )
}
