"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Navigation, Pencil, X, Check, MapPin, KeyRound, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// MiniMap: SSR 비활성화 (Leaflet은 브라우저 전용)
const MiniMap = dynamic(
  () => import("@/components/mini-map").then((m) => m.MiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] rounded-xl bg-secondary flex items-center justify-center">
        <span className="text-sm text-muted-foreground">지도 로딩 중...</span>
      </div>
    ),
  }
)

interface Building {
  id: string
  name: string
  address: string
  password: string
  memo?: string
  distance?: number
  latitude: number
  longitude: number
}

interface BuildingCardProps {
  building: Building
  showDistance?: boolean
  onPasswordUpdate?: (buildingId: string, newPassword: string, newMemo: string) => void
}

export function BuildingCard({ building, showDistance = true, onPasswordUpdate }: BuildingCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editPassword, setEditPassword] = useState(building.password)
  const [editMemo, setEditMemo] = useState(building.memo ?? "")
  const [isUpdating, setIsUpdating] = useState(false)

  // 저장 후 새로고침 없이 카드에 즉시 반영되는 로컬 상태
  const [localPassword, setLocalPassword] = useState(building.password)
  const [localMemo, setLocalMemo] = useState(building.memo ?? "")

  const openNavigation = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(
      `https://maps.google.com/maps?daddr=${building.latitude},${building.longitude}`,
      "_blank"
    )
  }

  const handleCardClick = () => {
    setModalOpen(true)
    setIsEditing(false)
    setEditPassword(localPassword)
    setEditMemo(localMemo)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditPassword(localPassword)
    setEditMemo(localMemo)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditPassword(localPassword)
    setEditMemo(localMemo)
  }

  const handleSave = async () => {
    const unchanged =
      editPassword === localPassword && editMemo === localMemo
    if (unchanged) {
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
          newMemo: editMemo,
        }),
      })

      if (response.ok) {
        setLocalPassword(editPassword)
        setLocalMemo(editMemo)
        onPasswordUpdate?.(building.id, editPassword, editMemo)
        setIsEditing(false)
      } else {
        alert("업데이트에 실패했습니다.")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("업데이트에 실패했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      {/* ── 카드 (리스트용) ── */}
      <Card
        className="overflow-hidden border-border bg-card transition-all hover:border-primary/50 cursor-pointer active:scale-[0.98]"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          <div className="flex items-stretch">
            {showDistance && building.distance !== undefined && (
              <div className="flex w-20 flex-shrink-0 flex-col items-center justify-center bg-secondary px-3 py-4">
                <span className="text-2xl font-bold text-primary">{building.distance}</span>
                <span className="text-sm text-muted-foreground">미터</span>
              </div>
            )}

            <div className="flex flex-1 items-center justify-between gap-3 px-4 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground leading-snug">
                  {building.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {building.address}
                </p>
                {localMemo && (
                  <p className="text-sm text-primary/80 mt-1 line-clamp-1">
                    📝 {localMemo}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="font-mono text-lg font-bold text-yellow-400 whitespace-nowrap tracking-wider">
                  {localPassword}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openNavigation}
                  className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  title="길 안내"
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 상세 정보 모달 ── */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setIsEditing(false)
        }}
      >
        <DialogContent className="max-w-sm w-full bg-card border-border p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-5 pt-5 pb-2">
            <DialogTitle className="text-xl font-bold text-foreground">
              {building.name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{building.address}</p>
          </DialogHeader>

          <div className="px-5 pb-5 space-y-4">

            {/* 정보 / 수정 영역 */}
            {isEditing ? (
              <div className="space-y-3 rounded-xl bg-secondary/60 p-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <KeyRound className="h-3.5 w-3.5" />
                    비밀번호
                  </label>
                  <Input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="h-12 text-lg font-mono bg-background border-primary/50 tracking-widest"
                    placeholder="비밀번호 입력"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    메모
                  </label>
                  <Input
                    type="text"
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    className="h-11 text-base bg-background border-border"
                    placeholder="예: 1동 출입구, 경비실 옆 등"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex-1 h-11 text-base font-semibold"
                  >
                    {isUpdating ? "저장 중..." : (
                      <><Check className="h-4 w-4 mr-1.5" />저장</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="flex-1 h-11 text-base border-border"
                  >
                    <X className="h-4 w-4 mr-1.5" />취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-secondary/60 p-4 space-y-3">
                {/* 비밀번호 표시 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">비밀번호</span>
                  </div>
                  <span className="font-mono text-2xl font-bold text-yellow-400 tracking-widest">
                    {localPassword}
                  </span>
                </div>

                <div className="border-t border-border" />

                {/* 메모 표시 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">메모</span>
                  </div>
                  <span className="text-sm text-right text-foreground break-words">
                    {localMemo || (
                      <span className="text-muted-foreground/50">없음</span>
                    )}
                  </span>
                </div>

                {/* 수정 버튼 */}
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="w-full h-10 text-sm border-border mt-1"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  비밀번호 / 메모 수정
                </Button>
              </div>
            )}

            {/* 미니 지도 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">건물 위치</span>
              </div>
              <MiniMap
                latitude={building.latitude}
                longitude={building.longitude}
                name={building.name}
              />
            </div>

            {/* 길 안내 버튼 */}
            <Button
              onClick={openNavigation}
              className="w-full h-12 text-base font-semibold"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Google 길 안내 시작
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
