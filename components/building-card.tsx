"use client"

import { useState } from "react"
import { Copy, Check, Navigation } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Building {
  id: string
  name: string
  address: string
  password: string
  distance?: number
  latitude: number
  longitude: number
}

interface BuildingCardProps {
  building: Building
  showDistance?: boolean
}

export function BuildingCard({ building, showDistance = true }: BuildingCardProps) {
  const [copied, setCopied] = useState(false)

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(building.password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("클립보드 복사 실패:", err)
    }
  }

  const openNavigation = () => {
    const url = `https://maps.google.com/maps?daddr=${building.latitude},${building.longitude}`
    window.open(url, "_blank")
  }

  return (
    <Card className="overflow-hidden border-border bg-card transition-all hover:border-primary/50">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Distance Badge */}
          {showDistance && building.distance !== undefined && (
            <div className="flex w-20 flex-shrink-0 flex-col items-center justify-center bg-secondary px-3 py-4">
              <span className="text-2xl font-bold text-primary">{building.distance}</span>
              <span className="text-xs text-muted-foreground">미터</span>
            </div>
          )}

          {/* Building Info */}
          <div className={`flex flex-1 flex-col justify-center py-3 ${showDistance && building.distance !== undefined ? 'px-4' : 'px-4'}`}>
            <h3 className="font-semibold text-foreground">{building.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {building.address}
            </p>
            
            {/* Password Display */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-primary/10 px-3 py-2">
                <span className="font-mono text-lg font-bold tracking-wider text-primary">
                  {building.password}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyPassword}
                className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={openNavigation}
                className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <Navigation className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
