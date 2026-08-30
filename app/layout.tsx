import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { DevServiceWorkerCleanup } from "@/components/pwa/dev-sw-cleanup";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expenso - Track your income and expenses",
  description: "Track your income and expenses",
  appleWebApp: {
    capable: true,
    title: "Expenso",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

// iOS ignores the manifest's icons/background_color for the install splash,
// so each supported device size needs its own generated image + media query.
// Regenerate with `node scripts/generate-splash.mjs` if the icon or title change.
const APPLE_SPLASH_SCREENS = [
  { width: 320, height: 568, ratio: 2 },
  { width: 375, height: 667, ratio: 2 },
  { width: 414, height: 896, ratio: 2 },
  { width: 375, height: 812, ratio: 3 },
  { width: 390, height: 844, ratio: 3 },
  { width: 393, height: 852, ratio: 3 },
  { width: 414, height: 736, ratio: 3 },
  { width: 414, height: 896, ratio: 3 },
  { width: 428, height: 926, ratio: 3 },
  { width: 430, height: 932, ratio: 3 },
  { width: 768, height: 1024, ratio: 2 },
  { width: 810, height: 1080, ratio: 2 },
  { width: 834, height: 1112, ratio: 2 },
  { width: 834, height: 1194, ratio: 2 },
  { width: 1024, height: 1366, ratio: 2 },
] as const;

const NO_FOUC_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("expenso-theme");
    var theme = stored || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FOUC_SCRIPT }} />
        {APPLE_SPLASH_SCREENS.map(({ width, height, ratio }) => (
          <link
            key={`${width}x${height}@${ratio}`}
            rel="apple-touch-startup-image"
            href={`/splash/apple-splash-${width * ratio}-${height * ratio}.png`}
            media={`(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`}
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
          <Toaster />
          <InstallPrompt />
          <DevServiceWorkerCleanup />
        </ThemeProvider>
      </body>
    </html>
  );
}
