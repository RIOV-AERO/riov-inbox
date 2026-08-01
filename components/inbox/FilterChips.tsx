"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

export interface FilterChipsLabel {
  slug: string;
  name: string;
}

export function FilterChips({
  unreadCount,
  labels,
  resultCount,
}: {
  unreadCount: number;
  labels: FilterChipsLabel[];
  resultCount?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const activeFilter = searchParams.get("filter");
  const activeLabel = searchParams.get("label");

  function hrefFor(next: { filter?: string; label?: string }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (next.filter) params.set("filter", next.filter);
    if (next.label) params.set("label", next.label);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const isAllActive = !activeFilter && !activeLabel;

  const unreadHref =
    activeFilter === "unread"
      ? hrefFor({ label: activeLabel ?? undefined })
      : hrefFor({ filter: "unread", label: activeLabel ?? undefined });

  const attachmentsHref =
    activeFilter === "attachments"
      ? hrefFor({ label: activeLabel ?? undefined })
      : hrefFor({ filter: "attachments", label: activeLabel ?? undefined });

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Chip href={hrefFor({})} active={isAllActive} tone="dark">
        Todos
      </Chip>
      <Chip href={unreadHref} active={activeFilter === "unread"}>
        Não Lidos{unreadCount > 0 ? ` · ${unreadCount}` : ""}
      </Chip>
      <Chip href={attachmentsHref} active={activeFilter === "attachments"}>
        Com Anexos
      </Chip>
      {labels.map((label) => {
        const isLabelActive = activeLabel === label.slug;
        const labelHref = isLabelActive
          ? hrefFor({ filter: activeFilter ?? undefined })
          : hrefFor({ label: label.slug, filter: activeFilter ?? undefined });
        return (
          <Chip key={label.slug} href={labelHref} active={isLabelActive}>
            {label.name}
          </Chip>
        );
      })}

      {q && resultCount !== undefined && (
        <div className="ml-auto text-[13px] text-ink-secondary">
          <strong className="font-semibold text-ink">
            {resultCount} resultado{resultCount === 1 ? "" : "s"}
          </strong>{" "}
          para &ldquo;{q}&rdquo;
        </div>
      )}
    </div>
  );
}

function Chip({
  href,
  active,
  tone = "green",
  children,
}: {
  href: string;
  active: boolean;
  tone?: "dark" | "green";
  children: React.ReactNode;
}) {
  if (!active) {
    return (
      <Link
        href={href}
        className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {children}
      </Link>
    );
  }

  if (tone === "dark") {
    return (
      <Link
        href={href}
        className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1.5 text-[13px] font-semibold text-accent-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
      <X size={11} strokeWidth={2.6} />
    </Link>
  );
}
