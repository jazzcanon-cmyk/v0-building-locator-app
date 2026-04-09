"use client"

import { useState } from "react"
import { Copy, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Building {
  id: string
  name: string
  address: string
  password: string
  latitude: number
  longitude: number
  distance?: number
}

interface SelectedBuildingInfoProps {
  building: Building
  onClose: () => void
}

export function SelectedBuildingInfo({ building, onClose }: SelectedBuildingInfoProps) {
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

  return (
    <Card className="mt-3 border-primary/50 bg-card animate-in slide-in-from-bottom-2 duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate">{building.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 truncate">{building.address}</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 rounded-lg bg-yellow-500/10 px-3 py-2">
                <span className="font-mono text-lg font-bold tracking-wider text-yellow-400">
                  {building.password}
                </span>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={copyPassword}
                className="h-10 w-10 shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
