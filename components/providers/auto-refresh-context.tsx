"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { EMAIL_CACHE_MS } from "@/lib/constants";

interface AutoRefreshContextType {
  lastRefreshTime: number;
  isRefreshing: boolean;
  refresh: () => void;
}

const AutoRefreshContext = createContext<AutoRefreshContextType | null>(null);

export function AutoRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(() =>
    Date.now(),
  );
  const lastRefreshRef = useRef<number>(lastRefreshTime);

  lastRefreshRef.current = lastRefreshTime;

  const refresh = useCallback(() => {
    const now = Date.now();
    setLastRefreshTime(now);
    lastRefreshRef.current = now;
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function checkAndRefresh() {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      const elapsed = now - lastRefreshRef.current;

      if (elapsed >= EMAIL_CACHE_MS) {
        refresh();
      }
    }

    function setupInterval() {
      if (intervalId) clearInterval(intervalId);
      if (document.visibilityState === "visible") {
        intervalId = setInterval(checkAndRefresh, EMAIL_CACHE_MS);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const elapsed = now - lastRefreshRef.current;
        if (elapsed >= EMAIL_CACHE_MS) {
          refresh();
        }
        setupInterval();
      } else if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    setupInterval();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return (
    <AutoRefreshContext.Provider
      value={{
        lastRefreshTime,
        isRefreshing: isPending,
        refresh,
      }}
    >
      {children}
    </AutoRefreshContext.Provider>
  );
}

export function useAutoRefresh() {
  const context = useContext(AutoRefreshContext);
  if (!context) {
    throw new Error(
      "useAutoRefresh must be used within an AutoRefreshProvider",
    );
  }
  return context;
}
