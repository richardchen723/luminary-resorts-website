"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ImageData {
  url: string
  cabinSlug: string
  caption: string | null
  bookingEngineCaption: string | null
  index: number
}

interface CategorizedImage {
  url: string
  category: "exterior" | "interior" | "nature" | "details" | null
  cabinSlug: string
}

export default function CategorizeImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [categorized, setCategorized] = useState<Map<string, CategorizedImage>>(new Map())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "uncategorized" | "exterior" | "interior" | "nature" | "details">("uncategorized")
  const [selectedCabin, setSelectedCabin] = useState<string>("all")

  // Load images from API
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch("/api/gallery/list-images")
        const data = await response.json()
        setImages(data.images || [])
        
        // Load saved categorizations from localStorage
        const saved = localStorage.getItem("image-categorizations")
        if (saved) {
          const savedMap = new Map(JSON.parse(saved))
          setCategorized(savedMap)
        }
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  // Save categorizations to localStorage and auto-save to server whenever they change
  useEffect(() => {
    if (categorized.size > 0) {
      const array = Array.from(categorized.entries())
      localStorage.setItem("image-categorizations", JSON.stringify(array))
      
      // Auto-save to server every 10 categorizations or when significant changes are made
      if (categorized.size % 10 === 0 || categorized.size > 50) {
        handleSaveToServer()
      }
    }
  }, [categorized])

  const handleCategorize = (url: string, category: "exterior" | "interior" | "nature" | "details") => {
    const image = images.find((img) => img.url === url)
    if (!image) return

    setCategorized((prev) => {
      const newMap = new Map(prev)
      newMap.set(url, {
        url,
        category,
        cabinSlug: image.cabinSlug,
      })
      return newMap
    })
  }

  const handleRemove = (url: string) => {
    setCategorized((prev) => {
      const newMap = new Map(prev)
      newMap.delete(url)
      return newMap
    })
  }

  const handleExport = () => {
    const categorizedArray = Array.from(categorized.values())
      .filter((img) => img.category !== null)
      .map((img) => {
        const image = images.find((i) => i.url === img.url)
        const caption = image?.caption || image?.bookingEngineCaption || "No caption"
        return `  // ${img.cabinSlug} - Image ${image?.index + 1}: ${caption}\n  { url: "${img.url}", category: "${img.category}", cabinSlug: "${img.cabinSlug}" },`
      })
      .join("\n")

    const code = `export const IMAGE_CATEGORY_MAP: ImageCategoryMapping[] = [\n${categorizedArray}\n]`

    // Copy to clipboard
    navigator.clipboard.writeText(code)
    alert(`Copied ${categorizedArray.split("\n").length / 2} categorized images to clipboard!`)
  }

  const handleSaveToServer = async () => {
    try {
      const categorizations = Array.from(categorized.entries())
      const response = await fetch("/api/gallery/save-categorizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categorizations),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Categorizations saved to server!")
        // Don't show alert for auto-saves, only manual saves
        if (categorized.size % 10 !== 0) {
          alert(data.message || "Categorizations saved and gallery file updated!")
        }
      } else {
        console.error("Failed to save categorizations")
        if (categorized.size % 10 !== 0) {
          alert("Failed to save categorizations")
        }
      }
    } catch (error) {
      console.error("Error saving to server:", error)
      if (categorized.size % 10 !== 0) {
        alert("Error saving categorizations")
      }
    }
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all categorizations?")) {
      setCategorized(new Map())
      localStorage.removeItem("image-categorizations")
    }
  }

  const filteredImages = images.filter((img) => {
    // Filter by cabin
    if (selectedCabin !== "all" && img.cabinSlug !== selectedCabin) {
      return false
    }

    // Filter by category status
    const categorizedImg = categorized.get(img.url)
    if (filter === "uncategorized") {
      return !categorizedImg || !categorizedImg.category
    } else if (filter === "all") {
      return true
    } else {
      return categorizedImg?.category === filter
    }
  })

  const stats = {
    total: images.length,
    categorized: Array.from(categorized.values()).filter((img) => img.category).length,
    exterior: Array.from(categorized.values()).filter((img) => img.category === "exterior").length,
    interior: Array.from(categorized.values()).filter((img) => img.category === "interior").length,
    nature: Array.from(categorized.values()).filter((img) => img.category === "nature").length,
    details: Array.from(categorized.values()).filter((img) => img.category === "details").length,
  }

  const cabins = Array.from(new Set(images.map((img) => img.cabinSlug)))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading images...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Image Categorization Tool</h1>
          <p className="text-muted-foreground mb-6">
            Click on a category button below each image to categorize it. Your progress is saved automatically.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{stats.categorized}</div>
              <div className="text-sm text-muted-foreground">Categorized</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.exterior}</div>
              <div className="text-sm text-muted-foreground">Exterior</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.interior}</div>
              <div className="text-sm text-muted-foreground">Interior</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.nature}</div>
              <div className="text-sm text-muted-foreground">Nature</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.details}</div>
              <div className="text-sm text-muted-foreground">Details</div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === "uncategorized" ? "default" : "outline"}
                onClick={() => setFilter("uncategorized")}
                size="sm"
              >
                Uncategorized
              </Button>
              <Button
                variant={filter === "exterior" ? "default" : "outline"}
                onClick={() => setFilter("exterior")}
                size="sm"
              >
                Exterior ({stats.exterior})
              </Button>
              <Button
                variant={filter === "interior" ? "default" : "outline"}
                onClick={() => setFilter("interior")}
                size="sm"
              >
                Interior ({stats.interior})
              </Button>
              <Button
                variant={filter === "nature" ? "default" : "outline"}
                onClick={() => setFilter("nature")}
                size="sm"
              >
                Nature ({stats.nature})
              </Button>
              <Button
                variant={filter === "details" ? "default" : "outline"}
                onClick={() => setFilter("details")}
                size="sm"
              >
                Details ({stats.details})
              </Button>
            </div>

            <div className="flex gap-2 ml-auto">
              <select
                value={selectedCabin}
                onChange={(e) => setSelectedCabin(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Cabins</option>
                {cabins.map((cabin) => (
                  <option key={cabin} value={cabin}>
                    {cabin.charAt(0).toUpperCase() + cabin.slice(1)}
                  </option>
                ))}
              </select>
              <Button onClick={handleExport} variant="default" size="sm">
                Export Code
              </Button>
              <Button onClick={handleSaveToServer} variant="default" size="sm">
                Save to Server
              </Button>
              <Button onClick={handleClearAll} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((img) => {
            const categorizedImg = categorized.get(img.url)
            const currentCategory = categorizedImg?.category

            return (
              <Card key={img.url} className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={img.url}
                    alt={`${img.cabinSlug} - Image ${img.index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {currentCategory && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 rounded text-xs font-medium capitalize">
                      {currentCategory}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    {img.cabinSlug.toUpperCase()} - Image {img.index + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button
                      size="sm"
                      variant={currentCategory === "exterior" ? "default" : "outline"}
                      onClick={() => handleCategorize(img.url, "exterior")}
                      className="text-xs"
                    >
                      Exterior
                    </Button>
                    <Button
                      size="sm"
                      variant={currentCategory === "interior" ? "default" : "outline"}
                      onClick={() => handleCategorize(img.url, "interior")}
                      className="text-xs"
                    >
                      Interior
                    </Button>
                    <Button
                      size="sm"
                      variant={currentCategory === "nature" ? "default" : "outline"}
                      onClick={() => handleCategorize(img.url, "nature")}
                      className="text-xs"
                    >
                      Nature
                    </Button>
                    <Button
                      size="sm"
                      variant={currentCategory === "details" ? "default" : "outline"}
                      onClick={() => handleCategorize(img.url, "details")}
                      className="text-xs"
                    >
                      Details
                    </Button>
                  </div>
                  {currentCategory && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(img.url)}
                      className="w-full text-xs text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No images found with the current filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
