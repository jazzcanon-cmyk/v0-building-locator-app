"use client";

import { useState, useCallback } from "react";
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

  const useFallback = useCallback(() => {
    setLatitude(FALLBACK_LATITUDE);
    setLongitude(FALLBACK_LONGITUDE);
    setAccuracy(null);
    setError(null);
    setLocationSource("fallback");
    setLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      useFallback();
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

      // POSITION_UNAVAILABLE: 폴백 좌표로 대체
      if (geoError.code === 2) {
        useFallback();
        return;
      }

      setLocationSource(null);
      setError(parsed);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, [accuracyMode, useFallback]);

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
