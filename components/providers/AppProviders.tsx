"use client";

import { ToastProvider } from "../toast/toast-context";
import { ToastStack } from "../toast/ToastStack";
import { ComposeProvider } from "../compose/compose-context";
import { ComposeWindow } from "../compose/ComposeWindow";
import { SidebarProvider } from "../layout/sidebar-context";
import { AutoRefreshProvider } from "./auto-refresh-context";

export function AppProviders({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { email: string; registeredEmails?: string[] };
}) {
  return (
    <SidebarProvider>
      <AutoRefreshProvider>
        <ToastProvider>
          <ComposeProvider>
            {children}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-3 p-5 sm:right-6 sm:left-auto sm:p-0 sm:pb-0 sm:pr-6">
              <ToastStack />
              <ComposeWindow user={user} />
            </div>
          </ComposeProvider>
        </ToastProvider>
      </AutoRefreshProvider>
    </SidebarProvider>
  );
}
