"use client"

import { useState } from "react"
import { Navigation, Pencil, X, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  onPasswordUpdate?: (buildingId: string, newPassword: string) => void
}

export function BuildingCard({ building, showDistance = true, onPasswordUpdate }: BuildingCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editPassword, setEditPassword] = useState(building.password)
  const [isUpdating, setIsUpdating] = useState(false)

  const openNavigation = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://maps.google.com/maps?daddr=${building.latitude},${building.longitude}`
    window.open(url, "_blank")
  }

  const openMap = () => {
    if (isEditing) return
    const url = `https://www.google.com/maps?q=${building.latitude},${building.longitude}`
    window.open(url, "_blank")
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditPassword(building.password)
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(false)
    setEditPassword(building.password)
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (editPassword === building.password) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch("/api/buildings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: building.id,
          name: building.name,
          newPassword: editPassword,
        }),
      })

      if (response.ok) {
        onPasswordUpdate?.(building.id, editPassword)
        setIsEditing(false)
      } else {
        alert("비밀번호 업데이트에 실패했습니다.")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("비밀번호 업데이트에 실패했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card 
      className="overflow-hidden border-border bg-card transition-all hover:border-primary/50 cursor-pointer active:scale-[0.98]"
      onClick={openMap}
    >
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
          <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-2">
                <span className="font-semibold">{building.name}</span>
                <span className="text-muted-foreground"> - </span>
                <span className="text-muted-foreground">{building.address}</span>
              </p>
            </div>
            
            {/* Password & Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isEditing ? (
                <>
                  <Input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-28 h-9 text-sm bg-secondary border-primary/50"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="h-9 w-9 text-primary hover:bg-primary/10"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-mono text-base font-bold text-yellow-400 whitespace-nowrap">
                    {building.password}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openNavigation}
                    className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
