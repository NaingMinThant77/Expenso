"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "expenso-install-dismissed-at";
const DISMISS_DAYS = 1;

function isDismissed() {
  const dismissedAt = localStorage.getItem(DISMISSED_KEY);
  if (!dismissedAt) return false;
  return Date.now() - Number(dismissedAt) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{
    pointerX: number;
    pointerY: number;
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone || isDismissed()) return;

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      if (isDismissed()) return;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function onAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISSED_KEY);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome === "dismissed") {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = cardRef.current!.getBoundingClientRect();
    dragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      left: rect.left,
      top: rect.top,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current || !cardRef.current) return;
    const { pointerX, pointerY, left, top } = dragStart.current;
    const rect = cardRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    const x = Math.min(
      Math.max(left + (e.clientX - pointerX), 0),
      Math.max(maxX, 0),
    );
    const y = Math.min(
      Math.max(top + (e.clientY - pointerY), 0),
      Math.max(maxY, 0),
    );
    setPosition({ x, y });
  }

  function onPointerUp() {
    dragStart.current = null;
    setDragging(false);
  }

  if (!visible) return null;

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={
        position
          ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
          : undefined
      }
      className={`fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm touch-none rounded-2xl border border-border bg-card p-4 shadow-2xl select-none sm:right-4 sm:left-auto ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <div className="flex gap-3 pr-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Image
            src="/icons/icon-512.png"
            alt="Expenso Logo"
            width={200}
            height={200}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            Install Expenso
          </p>
          <p className="text-xs text-muted-foreground">
            Add to home screen for native app feel & offline access.
          </p>
        </div>
      </div>
      <Button onClick={install} className="mt-3 w-full">
        <Download className="size-4" />
        Add to Home Screen
      </Button>
    </div>
  );
}
