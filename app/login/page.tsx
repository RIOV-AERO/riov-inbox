import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./_components/LoginForm";
import logo from "@/public/logo.png";

export const metadata: Metadata = {
  title: "Entrar · RIOV Inbox",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <div className="flex w-full max-w-95 flex-col gap-5 rounded-riov-xl border border-border bg-surface p-8 shadow-[0_6px_28px_rgba(30,40,35,0.07)]">
        <Image
          src={logo}
          alt="RIOV"
          width={44}
          height={44}
          className="rounded-riov-lg"
          priority
        />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Entrar na RIOV
          </h1>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Sua caixa de entrada, sem ruído.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
