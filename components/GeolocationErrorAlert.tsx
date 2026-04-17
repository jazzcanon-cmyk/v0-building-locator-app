"use client";

import { GeolocationErrorInfo } from "@/types/building";

interface Props {
  error: GeolocationErrorInfo;
  onDismiss?: () => void;
  onRetry?: () => void;
}

const ERROR_ICON: Record<number, string> = {
  1: "🚫",
  2: "📡",
  3: "⏱️",
};

export default function GeolocationErrorAlert({ error, onDismiss, onRetry }: Props) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          {ERROR_ICON[error.code] ?? "⚠️"}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-red-800">위치 오류</p>
          <p className="mt-0.5 text-sm text-red-700">{error.userMessage}</p>
          <p className="mt-1 font-mono text-xs text-red-500">
            [code={error.code}] {error.message}
          </p>
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
