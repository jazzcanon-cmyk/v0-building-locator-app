"use client";

import { useEffect, useState } from "react";
import { useGeolocation } from "@/lib/useGeolocation";
import { findClosestBuilding } from "@/lib/geolocation";
import { fetchBuildings } from "@/lib/buildingData";
import type { Building } from "@/types/building";
import GeolocationErrorAlert from "@/components/GeolocationErrorAlert";
import ClosestBuildingCard from "@/components/ClosestBuildingCard";
import AccuracyModeToggle from "@/components/AccuracyModeToggle";

export default function BuildingLocatorPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);

  const {
    latitude,
    longitude,
    accuracy,
    error,
    loading,
    accuracyMode,
    setAccuracyMode,
    requestLocation,
    clearError,
    locationSource,
  } = useGeolocation();

  useEffect(() => {
    void fetchBuildings().then(setBuildings);
  }, []);

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closestBuilding =
    latitude !== null && longitude !== null
      ? findClosestBuilding(buildings, latitude, longitude)
      : null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-base">🏢</span>
          <h1 className="text-sm font-semibold text-gray-800">건물 위치 찾기</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AccuracyModeToggle mode={accuracyMode} onChange={setAccuracyMode} />
          <button
            onClick={requestLocation}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> 위치 확인 중...
              </>
            ) : (
              <>
                <span>📡</span> 위치 새로고침
              </>
            )}
          </button>
        </div>

        {locationSource === "fallback" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">대략 위치 사용 중</p>
            <p className="mt-1 text-amber-800/90">
              실제 GPS를 쓸 수 없어 <strong>울산 남구</strong> 일대 기준 좌표로 안내합니다.
              결과는 실제 위치와 다를 수 있으니 &quot;위치 새로고침&quot;으로 다시 시도해
              주세요.
            </p>
          </div>
        )}

        {accuracy !== null && (
          <div className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm text-gray-600">
            <span className="font-medium">GPS 정확도:</span>{" "}
            <span
              className={
                accuracy <= 10
                  ? "text-green-600 font-semibold"
                  : accuracy <= 30
                    ? "text-yellow-600 font-semibold"
                    : "text-red-500 font-semibold"
              }
            >
              ±{Math.round(accuracy)}m
            </span>
            {accuracy > 30 && (
              <span className="ml-2 text-xs text-red-400">
                (정확도가 낮아 결과가 부정확할 수 있습니다)
              </span>
            )}
          </div>
        )}

        {error && (
          <GeolocationErrorAlert
            error={error}
            onRetry={requestLocation}
            onDismiss={clearError}
          />
        )}

        {latitude !== null && longitude !== null && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs text-gray-400 font-mono">
            현재 위치: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
        )}

        {latitude !== null && longitude !== null && !loading && (
          <>
            {closestBuilding ? (
              <ClosestBuildingCard building={closestBuilding} />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-gray-700">주변 건물 없음</p>
                <p className="mt-1 text-sm text-gray-500">
                  50m 이내에 등록된 건물이 없습니다.
                </p>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="animate-pulse rounded-2xl bg-gray-200 h-36" />
        )}

        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 space-y-1">
          <p className="font-semibold text-blue-800">위치 정확도 모드</p>
          <p>
            <strong>🎯 고정밀:</strong> GPS 우선, 더 정확하지만 시간이 걸림
            (enableHighAccuracy: true, timeout: 10s)
          </p>
          <p>
            <strong>⚡ 빠른:</strong> 네트워크 기반, 빠르지만 덜 정확함
            (enableHighAccuracy: false, timeout: 5s)
          </p>
        </div>
      </div>
    </main>
  );
}
