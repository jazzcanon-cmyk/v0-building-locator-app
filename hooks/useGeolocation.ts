"use client";

import { useState, useCallback, useRef } from "react";
import {
  parseGeolocationError,
  HIGH_ACCURACY_OPTIONS,
  LOW_ACCURACY_OPTIONS,
} from "@/lib/geolocation";
import { GeolocationErrorInfo } from "@/types/building";

export type AccuracyMode = "high" | "low";

/** 위치를 가져오지 못할 때 사용하는 기본 좌표 (울산 남구 일대) */
export const FALLBACK_LATITUDE = 35.5383;
export const FALLBACK_LONGITUDE = 129.3114;

export type LocationSource = "gps" | "fallback" | null;

interface UseGeolocationReturn {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: GeolocationErrorInfo | null;
  loading: boolean;
  accuracyMode: AccuracyMode;
  setAccuracyMode: (mode: AccuracyMode) => void;
  requestLocation: () => void;
  clearError: () => void;
  /** 실제 GPS가 아니라 기본 좌표를 쓰는 경우 */
  locationSource: LocationSource;
}

export function useGeolocation(): UseGeolocationReturn {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<GeolocationErrorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [accuracyMode, setAccuracyMode] = useState<AccuracyMode>("high");
  const [locationSource, setLocationSource] = useState<LocationSource>(null);

  // Keep a ref so we can cancel if needed
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert(
        "이 브라우저는 위치 서비스를 지원하지 않습니다. 울산 남구 일대 기준 위치로 안내합니다."
      );
      setLatitude(FALLBACK_LATITUDE);
      setLongitude(FALLBACK_LONGITUDE);
      setAccuracy(null);
      setError(null);
      setLocationSource("fallback");
      return;
    }

    setLoading(true);
    setError(null);

    const options =
      accuracyMode === "high" ? HIGH_ACCURACY_OPTIONS : LOW_ACCURACY_OPTIONS;

    const onSuccess = (position: GeolocationPosition) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setAccuracy(position.coords.accuracy);
      setLocationSource("gps");
      setLoading(false);
    };

    const onError = (geoError: GeolocationPositionError) => {
      const parsed = parseGeolocationError(geoError);
      console.error(
        `[Geolocation] code=${parsed.code} message=${parsed.message}`,
        geoError
      );

      // 위치를 잡을 수 없을 때: 안내 후 울산 남구 기본 좌표로 폴백
      if (geoError.code === 2) {
        alert(
          "현재 위치를 파악할 수 없습니다. GPS나 네트워크 상태를 확인해주세요."
        );
        setLatitude(FALLBACK_LATITUDE);
        setLongitude(FALLBACK_LONGITUDE);
        setAccuracy(null);
        setError(null);
        setLocationSource("fallback");
        setLoading(false);
        return;
      }

      setLocationSource(null);
      setError(parsed);
      setLoading(false);
    };

    // Clear previous watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Use getCurrentPosition for a one-shot fix
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, [accuracyMode]);

  const clearError = useCallback(() => setError(null), []);

  return {
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
  };
}
