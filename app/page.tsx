"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Building2, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BuildingCard } from "@/components/building-card"
import { LocationStatus } from "@/components/location-status"

interface Building {
  id: string
  name: string
  address: string
  password: string
  latitude: number
  longitude: number
  distance: number
}

// 두 좌표 사이의 거리 계산 (미터 단위)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3 // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchBuildings = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch("/api/buildings")
      if (!response.ok) throw new Error("데이터를 가져오는데 실패했습니다.")
      
      const data = await response.json()
      
      // 거리 계산 및 50m 이내 필터링
      const buildingsWithDistance = data.buildings
        .map((building: Omit<Building, "distance">) => ({
          ...building,
          distance: Math.round(
            calculateDistance(lat, lng, building.latitude, building.longitude)
          ),
        }))
        .filter((b: Building) => b.distance <= 50)
        .sort((a: Building, b: Building) => a.distance - b.distance)

      setBuildings(buildingsWithDistance)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching buildings:", err)
      setError("건물 데이터를 가져오는데 실패했습니다.")
    }
  }, [])

  const getLocation = useCallback(() => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("이 브라우저에서는 위치 서비스를 지원하지 않습니다.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
        await fetchBuildings(latitude, longitude)
        setLoading(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.")
            break
          case err.POSITION_UNAVAILABLE:
            setError("위치 정보를 사용할 수 없습니다.")
            break
          case err.TIMEOUT:
            setError("위치 정보 요청 시간이 초과되었습니다.")
            break
          default:
            setError("위치를 가져오는 중 오류가 발생했습니다.")
        }
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [fetchBuildings])

  useEffect(() => {
    getLocation()
  }, [getLocation])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">빌딩코드</h1>
                <p className="text-xs text-muted-foreground">공동현관 비밀번호</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={getLocation}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Location Status */}
      <LocationStatus
        loading={loading}
        error={error}
        location={location}
        lastUpdated={lastUpdated}
        buildingCount={buildings.length}
        onRetry={getLocation}
      />

      {/* Building List */}
      <section className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">주변 건물을 검색 중...</p>
          </div>
        ) : error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex flex-col items-center py-10">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="mt-4 text-center text-destructive">{error}</p>
              <Button onClick={getLocation} className="mt-6">
                다시 시도
              </Button>
            </CardContent>
          </Card>
        ) : buildings.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="flex flex-col items-center py-10">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">
                반경 50m 내에 등록된 건물이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {buildings.map((building) => (
              <BuildingCard key={building.id} building={building} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            배달/택배 기사님들의 빠른 배송을 응원합니다
          </p>
        </div>
      </footer>
    </main>
  )
}
