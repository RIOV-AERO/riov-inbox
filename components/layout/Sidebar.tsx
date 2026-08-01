"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Inbox,
  Circle,
  Send,
  Archive,
  Trash2,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { useCompose } from "../compose/compose-context";
import { logoutAction } from "@/lib/auth/actions";
import logo from "@/public/logo.png";

export interface SidebarLabel {
  id: string;
  slug: string;
  name: string;
  color: string;
}

export interface SidebarCounts {
  inbox: number;
  unread: number;
  archived: number;
}

export interface SidebarUser {
  name: string;
  email: string;
}

const NAV_ITEMS = [
  {
    href: "/inbox",
    label: "Caixa de Entrada",
    icon: Inbox,
    countKey: "inbox" as const,
  },
  {
    href: "/inbox?filter=unread",
    label: "Não Lidos",
    icon: Circle,
    countKey: "unread" as const,
    badge: true,
  },
  { href: "/sent", label: "Enviados", icon: Send },
  {
    href: "/archived",
    label: "Arquivados",
    icon: Archive,
    countKey: "archived" as const,
    muted: true,
  },
  { href: "/trash", label: "Lixeira", icon: Trash2 },
];

export function Sidebar({
  counts,
  labels,
  user,
}: {
  counts: SidebarCounts;
  labels: SidebarLabel[];
  user: SidebarUser;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isUnreadFilter = searchParams.get("filter") === "unread";
  const activeLabel = searchParams.get("label");
  const { isOpen, close } = useSidebar();
  const { openCompose } = useCompose();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={close}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-none flex-col border-r border-border bg-surface p-4 transition-transform duration-200 md:static md:z-auto md:w-63 md:h-full md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 flex-col gap-4">
          <div className="flex items-center gap-2.5 px-1.5 py-0.5">
            <Image
              src={logo}
              alt=""
              width={30}
              height={30}
              className="rounded-2.25"
            />
            <span className="text-[17px] font-bold tracking-tight text-ink">
              RIOV
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              openCompose();
              close();
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-accent text-[14.5px] font-semibold text-white shadow-riov-cta transition-colors hover:bg-accent-hover"
          >
            <Plus size={16} strokeWidth={2.2} />
            Novo e-mail
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-4">
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              let isActive: boolean;
              if (item.href === "/inbox") {
                isActive =
                  (pathname === "/inbox" || pathname.startsWith("/inbox/")) &&
                  !isUnreadFilter &&
                  !activeLabel;
              } else if (item.href === "/inbox?filter=unread") {
                isActive =
                  (pathname === "/inbox" || pathname.startsWith("/inbox/")) &&
                  isUnreadFilter;
              } else {
                isActive = pathname.startsWith(item.href);
              }
              const count = item.countKey ? counts[item.countKey] : undefined;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={true}
                  onClick={close}
                  className={`flex items-center gap-2.5 rounded-riov-md px-3 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? "bg-accent-tint font-semibold text-accent-deep"
                      : "font-medium text-ink-secondary hover:bg-frame/60"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.6} />
                  <span className="flex-1">{item.label}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={
                        item.badge
                          ? "rounded-full bg-accent px-1.75 py-0.5 text-[11px] font-semibold text-white"
                          : item.muted
                            ? "text-xs text-ink-muted"
                            : "text-xs font-semibold"
                      }
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {labels.length > 0 && (
            <>
              <div className="h-px bg-border-subtle" />
              <div className="flex flex-col gap-1">
                <div className="px-3 text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
                  Marcadores
                </div>
                {labels.map((label) => {
                  const isLabelActive =
                    (pathname === "/inbox" || pathname.startsWith("/inbox/")) &&
                    activeLabel === label.slug;
                  return (
                    <Link
                      key={label.id}
                      href={`/inbox?label=${label.slug}`}
                      prefetch={true}
                      onClick={close}
                      className={`flex items-center gap-2.5 rounded-riov-md px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isLabelActive
                          ? "bg-accent-tint font-semibold text-accent-deep"
                          : "font-medium text-ink-secondary hover:bg-frame/60"
                      }`}
                    >
                      <span
                        className="size-2 rounded-0.75 shrink-0"
                        style={{ background: label.color }}
                      />
                      <span className="flex-1 truncate">{label.name}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="relative shrink-0 border-t border-border-subtle pt-3">
          {menuOpen && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
          )}
          {menuOpen && (
            <div className="absolute bottom-full z-20 mb-2 flex w-full flex-col gap-0.5 rounded-riov-md border border-border bg-surface p-1.5 shadow-riov-toast">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-riov-sm px-2.5 py-2 text-sm text-ink-secondary hover:bg-frame/60"
              >
                <Settings size={15} strokeWidth={1.8} />
                Configurações
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-riov-sm px-2.5 py-2 text-left text-sm text-danger hover:bg-danger-tint"
                >
                  <LogOut size={15} strokeWidth={1.8} />
                  Sair
                </button>
              </form>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="relative z-20 flex w-full items-center gap-2.5 rounded-riov-lg border border-border-subtle p-2.5 text-left hover:border-border"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-2.5 bg-ink text-[13px] font-semibold text-white">
              {user.name[0]?.toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-ink">
                {user.name}
              </span>
              <span className="block truncate text-[11.5px] text-ink-muted">
                {user.email}
              </span>
            </span>
            <ChevronDown size={15} className="shrink-0 text-ink-muted" />
          </button>
        </div>
      </aside>
    </>
  );
}
