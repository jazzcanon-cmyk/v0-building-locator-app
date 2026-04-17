"use client";

import type { AccuracyMode } from "@/hooks/useGeolocation";

interface Props {
  mode: AccuracyMode;
  onChange: (mode: AccuracyMode) => void;
}

export default function AccuracyModeToggle({ mode, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("high")}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          mode === "high"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        🎯 고정밀
      </button>
      <button
        type="button"
        onClick={() => onChange("low")}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          mode === "low"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        ⚡ 빠른
      </button>
    </div>
  );
}
