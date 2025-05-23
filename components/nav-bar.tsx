"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Map } from "lucide-react"

export default function NavBar({ trackingId }: { trackingId?: string }) {
  const pathname = usePathname()

  return (
    <div className="border-b mb-6">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6" />
          <span className="font-bold text-lg">Location Tracker</span>
        </div>

        <div className="flex gap-4">
          <Link
            href="/"
            className={`flex items-center gap-1 px-3 py-2 rounded-md ${pathname === "/" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <Compass className="h-4 w-4" />
            <span>Track</span>
          </Link>

          {trackingId && (
            <Link
              href={`/map/${trackingId}`}
              className={`flex items-center gap-1 px-3 py-2 rounded-md ${pathname.startsWith("/map") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Map className="h-4 w-4" />
              <span>View Map</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
