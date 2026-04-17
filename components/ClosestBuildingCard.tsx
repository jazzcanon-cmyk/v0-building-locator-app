"use client";

import type { BuildingWithDistance } from "@/types/building";
import { formatDistance } from "@/lib/geolocation";

interface Props {
  building: BuildingWithDistance;
}

export default function ClosestBuildingCard({ building }: Props) {
  const subtitle = building.address ?? building.description;
  const openMaps = () => {
    window.open(
      `https://maps.google.com/maps?daddr=${building.latitude},${building.longitude}`,
      "_blank"
    );
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        가장 가까운 건물 · {formatDistance(building.distance)}
      </p>
      <h2 className="mt-2 text-xl font-bold text-gray-900">{building.name}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      {building.password != null && building.password !== "" && (
        <p className="mt-3 font-mono text-lg font-bold tracking-wider text-amber-600">
          {building.password}
        </p>
      )}
      {building.memo != null && building.memo !== "" && (
        <p className="mt-2 text-sm text-gray-500">📝 {building.memo}</p>
      )}
      <button
        type="button"
        onClick={openMaps}
        className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
      >
        지도에서 길 찾기
      </button>
    </div>
  );
}
