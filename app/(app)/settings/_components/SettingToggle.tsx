"use client";

import { useState, useTransition } from "react";

export function SettingToggle({
  initialValue,
  onToggle,
}: {
  initialValue: boolean;
  onToggle: (value: boolean) => Promise<void>;
}) {
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => {
        const next = !value;
        setValue(next);
        startTransition(() => {
          onToggle(next);
        });
      }}
      className={`flex h-6.75 w-11.5 shrink-0 items-center rounded-full p-0.75 transition-colors ${
        value ? "justify-end bg-accent" : "justify-start bg-border-strong"
      }`}
    >
      <span className="size-5.25 rounded-full bg-white shadow-sm" />
    </button>
  );
}
