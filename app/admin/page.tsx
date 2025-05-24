"use client"

import { useState, useEffect } from "react"
import { UrlShortener, type ShortUrl } from "@/lib/url-shortener"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ExternalLink, BarChart3, LinkIcon } from "lucide-react"
import Link from "next/link"

export default function AdminPanel() {
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([])

  useEffect(() => {
    loadShortUrls()
  }, [])

  const loadShortUrls = () => {
    const urls = UrlShortener.getAllShortUrls()
    setShortUrls(urls.sort((a, b) => b.createdAt - a.createdAt))
  }

  const deleteShortUrl = (shortCode: string) => {
    UrlShortener.deleteShortUrl(shortCode)
    loadShortUrls()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const totalClicks = shortUrls.reduce((sum, url) => sum + url.clicks, 0)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            URL Shortener Admin
          </h1>
          <p className="text-muted-foreground">Manage and monitor short URLs</p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <LinkIcon className="h-4 w-4 mr-2" />
            Create New Link
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Short URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{shortUrls.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalClicks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {shortUrls.length > 0 ? (totalClicks / shortUrls.length).toFixed(1) : "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Short URLs List */}
      <Card>
        <CardHeader>
          <CardTitle>All Short URLs</CardTitle>
          <CardDescription>Manage your shortened location sharing links</CardDescription>
        </CardHeader>
        <CardContent>
          {shortUrls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No short URLs created yet</p>
              <Link href="/">
                <Button className="mt-4">Create Your First Link</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {shortUrls.map((shortUrl) => (
                <div key={shortUrl.shortCode} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">/s/{shortUrl.shortCode}</code>
                      <Badge variant="outline">{shortUrl.clicks} clicks</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Session: {shortUrl.sessionId}</p>
                      <p>Created: {formatDate(shortUrl.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/s/${shortUrl.shortCode}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/map/${shortUrl.sessionId}`} target="_blank">
                      <Button variant="outline" size="sm">
                        View Map
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteShortUrl(shortUrl.shortCode)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
