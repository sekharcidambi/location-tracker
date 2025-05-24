// Simple URL shortener utility
export interface ShortUrl {
  shortCode: string
  originalUrl: string
  sessionId: string
  createdAt: number
  clicks: number
}

export class UrlShortener {
  private static generateShortCode(length = 6): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static createShortUrl(originalUrl: string, sessionId: string): string {
    // Generate a unique short code
    let shortCode = this.generateShortCode()

    // Check if code already exists and regenerate if needed
    const existingUrls = this.getAllShortUrls()
    while (existingUrls.some((url) => url.shortCode === shortCode)) {
      shortCode = this.generateShortCode()
    }

    const shortUrl: ShortUrl = {
      shortCode,
      originalUrl,
      sessionId,
      createdAt: Date.now(),
      clicks: 0,
    }

    // Store in localStorage
    localStorage.setItem(`short_url_${shortCode}`, JSON.stringify(shortUrl))

    // Also add to index
    const shortUrlIndex = JSON.parse(localStorage.getItem("short_url_index") || "[]")
    shortUrlIndex.push(shortCode)
    localStorage.setItem("short_url_index", JSON.stringify(shortUrlIndex))

    return shortCode
  }

  static getOriginalUrl(shortCode: string): ShortUrl | null {
    const shortUrlData = localStorage.getItem(`short_url_${shortCode}`)
    if (shortUrlData) {
      return JSON.parse(shortUrlData)
    }
    return null
  }

  static incrementClick(shortCode: string): void {
    const shortUrl = this.getOriginalUrl(shortCode)
    if (shortUrl) {
      shortUrl.clicks++
      localStorage.setItem(`short_url_${shortCode}`, JSON.stringify(shortUrl))
    }
  }

  static getAllShortUrls(): ShortUrl[] {
    const shortUrlIndex = JSON.parse(localStorage.getItem("short_url_index") || "[]")
    return shortUrlIndex.map((code: string) => this.getOriginalUrl(code)).filter((url: ShortUrl | null) => url !== null)
  }

  static deleteShortUrl(shortCode: string): void {
    localStorage.removeItem(`short_url_${shortCode}`)
    const shortUrlIndex = JSON.parse(localStorage.getItem("short_url_index") || "[]")
    const updatedIndex = shortUrlIndex.filter((code: string) => code !== shortCode)
    localStorage.setItem("short_url_index", JSON.stringify(updatedIndex))
  }
}
