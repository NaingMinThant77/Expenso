import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Turbopack (the default dev/build engine in Next 16) can't run the
  // Workbox webpack plugin that @ducanh2912/next-pwa injects below.
  // An empty turbopack config silences Next's guard for dev; production
  // builds explicitly opt back into webpack via `next build --webpack`
  // so the service worker actually gets generated.
  turbopack: {},
};

export default withPWA(nextConfig);
