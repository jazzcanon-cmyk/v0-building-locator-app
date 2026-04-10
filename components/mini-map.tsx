"use client"

import { useEffect, useRef } from "react"

interface MiniMapProps {
  latitude: number
  longitude: number
  name: string
}

export function MiniMap({ latitude, longitude, name }: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Leaflet은 SSR에서 문제가 되므로 동적 import
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Leaflet 기본 마커 아이콘 경로 수정 (Next.js 빌드 이슈 방지)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: [latitude, longitude],
        zoom: 17,
        zoomControl: false,       // 미니맵이므로 컨트롤 숨김
        scrollWheelZoom: false,
        dragging: false,          // 드래그 비활성화 (팝업 안이므로)
        doubleClickZoom: false,
        attributionControl: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map)

      // 커스텀 빨간 마커 (건물 강조)
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:16px;height:16px;
            background:#ef4444;
            border:3px solid #fff;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(0,0,0,0.4);
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      L.marker([latitude, longitude], { icon })
        .addTo(map)
        .bindPopup(name, { closeButton: false, offset: [0, -8] })
        .openPopup()

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, name])

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden"
        style={{ height: 200 }}
      />
    </>
  )
}
