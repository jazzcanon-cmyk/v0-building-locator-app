"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { MapPin, Building2, Loader2, AlertCircle, RefreshCw, Search, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BuildingCard } from "@/components/building-card"
import { LocationStatus } from "@/components/location-status"
import { SelectedBuildingInfo } from "@/components/selected-building-info"

// 지도 컴포넌트 동적 import (SSR 비활성화)
const BuildingMap = dynamic(
  () => import("@/components/building-map").then((mod) => mod.BuildingMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] rounded-xl bg-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
)

interface Building {
  id: string
  name: string
  address: string
  password: string
  latitude: number
  longitude: number
  distance?: number
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

type TabType = "nearby" | "search"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("nearby")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [allBuildings, setAllBuildings] = useState<Building[]>([])
  const [nearbyBuildings, setNearbyBuildings] = useState<Building[]>([])
  const [searchResults, setSearchResults] = useState<Building[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)

  const fetchBuildings = useCallback(async (lat?: number, lng?: number) => {
    try {
      const response = await fetch("/api/buildings")
      if (!response.ok) throw new Error("데이터를 가져오는데 실패했습니다.")
      
      const data = await response.json()
      setAllBuildings(data.buildings)
      
      // 위치가 있으면 거리 계산 및 50m 이내 필터링
      if (lat !== undefined && lng !== undefined) {
        const buildingsWithDistance = data.buildings
          .map((building: Building) => ({
            ...building,
            distance: Math.round(
              calculateDistance(lat, lng, building.latitude, building.longitude)
            ),
          }))
          .filter((b: Building) => (b.distance ?? 0) <= 50)
          .sort((a: Building, b: Building) => (a.distance ?? 0) - (b.distance ?? 0))

        setNearbyBuildings(buildingsWithDistance)
      }
      
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
        // 위치 오류가 있어도 검색 기능은 사용할 수 있도록 데이터 로드
        fetchBuildings()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [fetchBuildings])

  // 검색 기능
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    
    if (query.trim() === "") {
      setSearchResults([])
      return
    }
    
    const lowerQuery = query.toLowerCase().trim()
    const filtered = allBuildings.filter(
      (building) =>
        building.name.toLowerCase().includes(lowerQuery) ||
        building.address.toLowerCase().includes(lowerQuery)
    )
    setSearchResults(filtered)
  }, [allBuildings])

  // 지도에서 건물 선택
  const handleBuildingSelect = useCallback((building: Building | null) => {
    setSelectedBuilding(building)
  }, [])

  // 비밀번호 업데이트 핸들러
  const handlePasswordUpdate = useCallback((buildingId: string, newPassword: string) => {
    // 전체 건물 목록 업데이트
    setAllBuildings(prev => 
      prev.map(b => b.id === buildingId ? { ...b, password: newPassword } : b)
    )
    // 주변 건물 목록 업데이트
    setNearbyBuildings(prev => 
      prev.map(b => b.id === buildingId ? { ...b, password: newPassword } : b)
    )
    // 검색 결과 업데이트
    setSearchResults(prev => 
      prev.map(b => b.id === buildingId ? { ...b, password: newPassword } : b)
    )
    // 선택된 건물 업데이트
    if (selectedBuilding?.id === buildingId) {
      setSelectedBuilding(prev => prev ? { ...prev, password: newPassword } : null)
    }
  }, [selectedBuilding])

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
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-sm" />
                <svg 
                  className="relative h-5 w-5 text-primary-foreground" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <path d="M9 9v.01" />
                  <path d="M9 12v.01" />
                  <path d="M9 15v.01" />
                  <path d="M9 18v.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">신정대리점</h1>
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

        {/* Tab Navigation */}
        <div className="container mx-auto px-4 pb-3">
          <div className="flex gap-2 rounded-lg bg-secondary p-1">
            <button
              onClick={() => {
                setActiveTab("nearby")
                setSelectedBuilding(null)
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "nearby"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Navigation className="h-4 w-4" />
              내 주변
            </button>
            <button
              onClick={() => {
                setActiveTab("search")
                setSelectedBuilding(null)
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === "search"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-4 w-4" />
              검색
            </button>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === "nearby" ? (
        <>
          {/* Location Status */}
          <LocationStatus
            loading={loading}
            error={error}
            location={location}
            lastUpdated={lastUpdated}
            buildingCount={nearbyBuildings.length}
            onRetry={getLocation}
          />

          {/* Map Section */}
          {!loading && !error && location && (
            <section className="container mx-auto px-4 pt-4">
              <BuildingMap
                userLocation={location}
                buildings={allBuildings}
                onBuildingSelect={handleBuildingSelect}
                selectedBuilding={selectedBuilding}
              />
              {selectedBuilding && (
                <SelectedBuildingInfo
                  building={selectedBuilding}
                  onClose={() => setSelectedBuilding(null)}
                  onPasswordUpdate={handlePasswordUpdate}
                />
              )}
            </section>
          )}

          {/* Nearby Building List */}
          <section className="container mx-auto px-4 py-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              반경 50m 내 건물
            </h2>
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
            ) : nearbyBuildings.length === 0 ? (
              <Card className="bg-card">
                <CardContent className="flex flex-col items-center py-10">
                  <MapPin className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-center text-muted-foreground">
                    반경 50m 내에 등록된 건물이 없습니다.
                  </p>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    지도에서 마커를 클릭하거나 검색 탭을 이용해보세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {nearbyBuildings.map((building) => (
                  <BuildingCard 
                    key={building.id} 
                    building={building} 
                    showDistance 
                    onPasswordUpdate={handlePasswordUpdate}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Search Section */}
          <section className="container mx-auto px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="건물명 or 주소 넣어보세요"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground/50"
                autoFocus
              />
            </div>
          </section>

          {/* Search Results */}
          <section className="container mx-auto px-4 pb-6">
            {searchQuery.trim() === "" ? (
              <Card className="bg-card">
                <CardContent className="flex flex-col items-center py-10">
                  <Search className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-center text-muted-foreground">
                    건물명 또는 주소를 검색해주세요
                  </p>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    등록된 건물 {allBuildings.length}개
                  </p>
                </CardContent>
              </Card>
            ) : searchResults.length === 0 ? (
              <Card className="bg-card">
                <CardContent className="flex flex-col items-center py-10">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-center text-muted-foreground">
                    &apos;{searchQuery}&apos;에 대한 검색 결과가 없습니다.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  검색 결과 {searchResults.length}건
                </p>
                {searchResults.map((building) => (
                  <BuildingCard 
                    key={building.id} 
                    building={building} 
                    showDistance={false} 
                    onPasswordUpdate={handlePasswordUpdate}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

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
