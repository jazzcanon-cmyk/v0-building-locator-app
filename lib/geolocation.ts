import { Building, BuildingWithDistance, GeolocationErrorInfo } from "@/types/building";

// ────────────────────────────────────────────────────────────────
// Geolocation error handling
// ────────────────────────────────────────────────────────────────

export function parseGeolocationError(error: GeolocationPositionError): GeolocationErrorInfo {
  const codeMap: Record<number, { message: string; userMessage: string }> = {
    1: {
      message: "PERMISSION_DENIED",
      userMessage:
        "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해 주세요.",
    },
    2: {
      message: "POSITION_UNAVAILABLE",
      userMessage:
        "현재 위치를 가져올 수 없습니다. GPS 또는 네트워크 상태를 확인해 주세요.",
    },
    3: {
      message: "TIMEOUT",
      userMessage: "위치 요청 시간이 초과되었습니다. 다시 시도해 주세요.",
    },
  };

  const info = codeMap[error.code] ?? {
    message: "UNKNOWN_ERROR",
    userMessage: "알 수 없는 오류가 발생했습니다.",
  };

  return {
    code: error.code as 1 | 2 | 3,
    message: info.message,
    userMessage: info.userMessage,
  };
}

// ────────────────────────────────────────────────────────────────
// Geolocation options
// ────────────────────────────────────────────────────────────────

export const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,       // 10 seconds
  maximumAge: 0,        // always fresh
};

export const LOW_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 30000,    // 30 seconds cache OK
};

// ────────────────────────────────────────────────────────────────
// Distance calculation (Haversine formula)
// ────────────────────────────────────────────────────────────────

/**
 * Calculate distance between two lat/lng points in meters.
 * Uses the Haversine formula (assumes a spherical Earth).
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ────────────────────────────────────────────────────────────────
// Building filters
// ────────────────────────────────────────────────────────────────

const MAX_DISTANCE_METERS = 50;

/**
 * Attach distance values to each building, filter to ≤ 50 m,
 * sort ascending, and return only the closest one (or null).
 */
export function findClosestBuilding(
  buildings: Building[],
  userLat: number,
  userLng: number
): BuildingWithDistance | null {
  const withDistances: BuildingWithDistance[] = buildings
    .map((building) => ({
      ...building,
      distance: calculateDistance(
        userLat,
        userLng,
        building.latitude,
        building.longitude
      ),
    }))
    .filter((b) => b.distance <= MAX_DISTANCE_METERS)
    .sort((a, b) => a.distance - b.distance);

  return withDistances[0] ?? null;
}

/**
 * Return all buildings within MAX_DISTANCE_METERS, sorted by distance.
 * Useful for debugging / showing a list.
 */
export function getBuildingsWithinRange(
  buildings: Building[],
  userLat: number,
  userLng: number,
  maxDistance: number = MAX_DISTANCE_METERS
): BuildingWithDistance[] {
  return buildings
    .map((building) => ({
      ...building,
      distance: calculateDistance(
        userLat,
        userLng,
        building.latitude,
        building.longitude
      ),
    }))
    .filter((b) => b.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

// ────────────────────────────────────────────────────────────────
// Human-readable distance formatter
// ────────────────────────────────────────────────────────────────

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
