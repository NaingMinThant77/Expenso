"use client";

import { useEffect } from "react";

/**
 * next-pwa's `disable: development` only stops a NEW service worker from
 * being registered in dev — it does nothing about one already registered
 * in the browser from a prior `next build --webpack` test. That stale
 * worker keeps CacheFirst-serving old /_next/static chunks over Turbopack's
 * fresh dev chunks, causing "module factory is not available" crashes.
 */
export function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });

    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }, []);

  return null;
}
