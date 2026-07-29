"use client";

import { useState, useTransition } from "react";
import { setDensityAction } from "../actions";

const OPTIONS = [
  { value: "COMPACT", label: "Compacta" },
  { value: "COMFORTABLE", label: "Confortável" },
  { value: "SPACIOUS", label: "Ampla" },
] as const;

export function DensityControl({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();

  return (
    <div className="flex rounded-full bg-frame p-0.75">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            setValue(option.value);
            startTransition(() => {
              setDensityAction(option.value);
            });
          }}
          className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            value === option.value
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-secondary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
