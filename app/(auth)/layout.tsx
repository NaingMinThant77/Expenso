import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-32 -left-24 size-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-32 size-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative flex size-40 items-center justify-center rounded-2xl bg-background p-3 shadow-[0_0_40px_-8px_var(--primary-glow)] ring-1 ring-border/60 transition-transform hover:scale-105">
            <Image
              src="/icons/icon-512.png"
              alt="Expenso Logo"
              width={512}
              height={512}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <div>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              Expenso
            </p>
            <p className="text-sm text-muted-foreground">
              Track your income and expenses
            </p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
