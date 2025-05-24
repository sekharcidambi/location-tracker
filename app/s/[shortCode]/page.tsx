"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { UrlShortener } from "@/lib/url-shortener"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ShortUrlRedirect() {
  const params = useParams()
  const router = useRouter()
  const shortCode = params.shortCode as string
  const [shortUrl, setShortUrl] = useState<any>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (shortCode) {
      const urlData = UrlShortener.getOriginalUrl(shortCode)
      if (urlData) {
        setShortUrl(urlData)
        UrlShortener.incrementClick(shortCode)

        // Auto-redirect after 3 seconds
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setIsRedirecting(true)
              router.push(`/map/${urlData.sessionId}`)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      }
    }
  }, [shortCode, router])

  const handleManualRedirect = () => {
    if (shortUrl) {
      setIsRedirecting(true)
      router.push(`/map/${shortUrl.sessionId}`)
    }
  }

  if (!shortUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Link Not Found</CardTitle>
            <CardDescription>The short link you're looking for doesn't exist or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>Go to Location Tracker</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Location Tracker</CardTitle>
          <CardDescription>You're about to view a shared location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Session ID:</p>
            <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{shortUrl.sessionId}</p>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {isRedirecting ? "Redirecting..." : `Redirecting in ${countdown} seconds`}
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleManualRedirect} className="flex-1" disabled={isRedirecting}>
              <ArrowRight className="h-4 w-4 mr-2" />
              View Location Now
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              Short URL: {window.location.origin}/s/{shortCode}
            </p>
            <p>Clicks: {shortUrl.clicks}</p>
            <p>Created: {new Date(shortUrl.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
