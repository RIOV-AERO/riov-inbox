"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/toast/toast-context";

export function NotificationToggle({
  initialValue,
  onToggle,
}: {
  initialValue: boolean;
  onToggle: (value: boolean) => Promise<void>;
}) {
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();
  const { push } = useToast();

  async function handleToggle() {
    const next = !value;

    if (next) {
      if (typeof window === "undefined" || !("Notification" in window)) {
        push({
          variant: "error",
          title: "Notificações não suportadas",
          description: "Seu navegador não possui suporte a notificações nativas.",
        });
        return;
      }

      let permission = Notification.permission;

      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        push({
          variant: "error",
          title: "Permissão negada no navegador",
          description:
            "Habilite as permissões de notificação nas configurações do seu navegador ou celular.",
        });
        setValue(false);
        return;
      }

      push({
        variant: "success",
        title: "Notificações ativadas",
        description: "Você receberá alertas quando novos e-mails chegarem.",
      });
    }

    setValue(next);
    startTransition(() => {
      onToggle(next);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={handleToggle}
      className={`flex h-6.75 w-11.5 shrink-0 items-center rounded-full p-0.75 transition-colors ${
        value ? "justify-end bg-accent" : "justify-start bg-border-strong"
      }`}
    >
      <span className="size-5.25 rounded-full bg-white shadow-sm" />
    </button>
  );
}
