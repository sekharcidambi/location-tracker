"use client"

export type LocationData = {
  latitude: number
  longitude: number
  timestamp: number
  accuracy?: number
  id?: string
}

// Generate a unique ID for this tracking session
export const generateTrackingId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Save locations to localStorage
export const saveLocations = (trackingId: string, locations: LocationData[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`location-tracker-${trackingId}`, JSON.stringify(locations))
  }
}

// Get locations from localStorage
export const getLocations = (trackingId: string): LocationData[] => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(`location-tracker-${trackingId}`)
    if (data) {
      return JSON.parse(data)
    }
  }
  return []
}

// Format timestamp
export const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Format date
export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}
