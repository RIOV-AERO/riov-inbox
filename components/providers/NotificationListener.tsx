"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function NotificationListener({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const lastCheckRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const interval = setInterval(async () => {
      try {
        const since = lastCheckRef.current;
        lastCheckRef.current = Date.now();

        const res = await fetch(`/api/emails/latest?since=${since}`);
        if (!res.ok) return;

        const data = await res.json();
        if (
          data.emails &&
          Array.isArray(data.emails) &&
          data.emails.length > 0
        ) {
          for (const email of data.emails) {
            const notification = new Notification(
              `Novo e-mail de ${email.senderName}`,
              {
                body: email.subject,
                icon: "/logo.png",
                tag: email.id,
              },
            );

            notification.onclick = () => {
              window.focus();
              router.push(`/inbox/${email.id}`);
            };
          }
        }
      } catch {
        // Suppress background polling network errors
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [enabled, router]);

  return null;
}
