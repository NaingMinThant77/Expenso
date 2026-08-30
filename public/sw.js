if (!self.define) {
  let e,
    s = {};
  const a = (a, n) => (
    (a = new URL(a + ".js", n).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = a), (e.onload = s), document.head.appendChild(e));
        } else ((e = a), importScripts(a), s());
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, c) => {
    const i =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[i]) return;
    let t = {};
    const r = (e) => a(e, i),
      f = { module: { uri: i }, exports: t, require: r };
    s[i] = Promise.all(n.map((e) => f[e] || r(e))).then((e) => (c(...e), t));
  };
}
define(["./workbox-f1770938"], function (e) {
  "use strict";
  (importScripts("/worker-2286d8bc9e24aab5.js"),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/0GLhc_-VZXXsSZLdf6ZV2/_buildManifest.js",
          revision: "af471fe2986dbd309c9464164945e9d3",
        },
        {
          url: "/_next/static/0GLhc_-VZXXsSZLdf6ZV2/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/206-f26b067fa1bd8f88.js",
          revision: "f26b067fa1bd8f88",
        },
        {
          url: "/_next/static/chunks/226-9aee39d15d09f579.js",
          revision: "9aee39d15d09f579",
        },
        {
          url: "/_next/static/chunks/228-0a7ac11b15cc4a66.js",
          revision: "0a7ac11b15cc4a66",
        },
        {
          url: "/_next/static/chunks/266-4f8e8a260decf08f.js",
          revision: "4f8e8a260decf08f",
        },
        {
          url: "/_next/static/chunks/437-47817ecde83ef1d4.js",
          revision: "47817ecde83ef1d4",
        },
        {
          url: "/_next/static/chunks/469-34a7f80468ac29a5.js",
          revision: "34a7f80468ac29a5",
        },
        {
          url: "/_next/static/chunks/4bd1b696-c9cc1fe3b38e59bb.js",
          revision: "c9cc1fe3b38e59bb",
        },
        {
          url: "/_next/static/chunks/500-2d1136a2b6ea2d76.js",
          revision: "2d1136a2b6ea2d76",
        },
        {
          url: "/_next/static/chunks/519-36e18a2e41aeddd5.js",
          revision: "36e18a2e41aeddd5",
        },
        {
          url: "/_next/static/chunks/568-42c19a32813d4ac0.js",
          revision: "42c19a32813d4ac0",
        },
        {
          url: "/_next/static/chunks/570-e6020f38e2d97f09.js",
          revision: "e6020f38e2d97f09",
        },
        {
          url: "/_next/static/chunks/612-8c326064459a20a3.js",
          revision: "8c326064459a20a3",
        },
        {
          url: "/_next/static/chunks/62-cb617cd8b62a4b38.js",
          revision: "cb617cd8b62a4b38",
        },
        {
          url: "/_next/static/chunks/698-b1e77086c0603436.js",
          revision: "b1e77086c0603436",
        },
        {
          url: "/_next/static/chunks/711-e6f9a20f0aa43eef.js",
          revision: "e6f9a20f0aa43eef",
        },
        {
          url: "/_next/static/chunks/778-226b6c5b0994e2c7.js",
          revision: "226b6c5b0994e2c7",
        },
        {
          url: "/_next/static/chunks/781-0e63446a9e5c5fe7.js",
          revision: "0e63446a9e5c5fe7",
        },
        {
          url: "/_next/static/chunks/843-bf93fc5cfe604848.js",
          revision: "bf93fc5cfe604848",
        },
        {
          url: "/_next/static/chunks/899.b630575cb00841a2.js",
          revision: "b630575cb00841a2",
        },
        {
          url: "/_next/static/chunks/928-2da24a61c483e6a9.js",
          revision: "2da24a61c483e6a9",
        },
        {
          url: "/_next/static/chunks/966.83c76036c0a8ff77.js",
          revision: "83c76036c0a8ff77",
        },
        {
          url: "/_next/static/chunks/app/(app)/calendar/page-1a814ee4c908f925.js",
          revision: "1a814ee4c908f925",
        },
        {
          url: "/_next/static/chunks/app/(app)/layout-c9ff14bc1bf0ae84.js",
          revision: "c9ff14bc1bf0ae84",
        },
        {
          url: "/_next/static/chunks/app/(app)/page-e31b1a9c2672d75d.js",
          revision: "e31b1a9c2672d75d",
        },
        {
          url: "/_next/static/chunks/app/(app)/settings/categories/page-558ae0812f0e4c77.js",
          revision: "558ae0812f0e4c77",
        },
        {
          url: "/_next/static/chunks/app/(app)/settings/page-3db4e25591167566.js",
          revision: "3db4e25591167566",
        },
        {
          url: "/_next/static/chunks/app/(app)/transactions/page-8079fe36078d42e9.js",
          revision: "8079fe36078d42e9",
        },
        {
          url: "/_next/static/chunks/app/(auth)/layout-a22c2a9ffe48d9a8.js",
          revision: "a22c2a9ffe48d9a8",
        },
        {
          url: "/_next/static/chunks/app/(auth)/login/page-25024abc5ace5119.js",
          revision: "25024abc5ace5119",
        },
        {
          url: "/_next/static/chunks/app/(auth)/register/page-728ee2de4f7c850f.js",
          revision: "728ee2de4f7c850f",
        },
        {
          url: "/_next/static/chunks/app/_global-error/page-19834e2014ad184e.js",
          revision: "19834e2014ad184e",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-8c1f47904b7fb42e.js",
          revision: "8c1f47904b7fb42e",
        },
        {
          url: "/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-19834e2014ad184e.js",
          revision: "19834e2014ad184e",
        },
        {
          url: "/_next/static/chunks/app/api/cron/daily-reminder/route-19834e2014ad184e.js",
          revision: "19834e2014ad184e",
        },
        {
          url: "/_next/static/chunks/app/layout-6949a369b3ef6065.js",
          revision: "6949a369b3ef6065",
        },
        {
          url: "/_next/static/chunks/app/manifest.webmanifest/route-19834e2014ad184e.js",
          revision: "19834e2014ad184e",
        },
        {
          url: "/_next/static/chunks/framework-b820d88d6bcfde5e.js",
          revision: "b820d88d6bcfde5e",
        },
        {
          url: "/_next/static/chunks/main-7cbdb44b43440e72.js",
          revision: "7cbdb44b43440e72",
        },
        {
          url: "/_next/static/chunks/main-app-f82026f3fe7025d1.js",
          revision: "f82026f3fe7025d1",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/app-error-19834e2014ad184e.js",
          revision: "19834e2014ad184e",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/forbidden-19834e2014ad184e.js",
          revision: "19834e2014ad184e",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/global-error-4345cff9e90e87ee.js",
          revision: "4345cff9e90e87ee",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/not-found-19834e2014ad184e.js",
          revision: "19834e2014ad184e",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/unauthorized-19834e2014ad184e.js",
          revision: "19834e2014ad184e",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-06ccb2f4b7437913.js",
          revision: "06ccb2f4b7437913",
        },
        {
          url: "/_next/static/css/2d9749cc73fe4af2.css",
          revision: "2d9749cc73fe4af2",
        },
        {
          url: "/_next/static/media/013b72fa676f92e0-s.woff2",
          revision: "bc06a1ea50382b6956e53aeb91c889c1",
        },
        {
          url: "/_next/static/media/22a5144ee8d83bca-s.p.woff2",
          revision: "f4634c3bc1fa7cb53247e1f2872adb5a",
        },
        {
          url: "/_next/static/media/2b5b02fc7e511755-s.woff2",
          revision: "a27466d069120e75e25b4fd06edd5be2",
        },
        {
          url: "/_next/static/media/65f03d54ccadf4a8-s.woff2",
          revision: "58bcf4f276e0844890901b91c411447c",
        },
        {
          url: "/_next/static/media/7d4881bb7e1bf84d-s.p.woff2",
          revision: "cd5b25781181c5c03d99ac2cbf88016a",
        },
        {
          url: "/_next/static/media/9766a7e9e2e0ad5a-s.woff2",
          revision: "9a45f5a5937490fac6d4f5043a36c125",
        },
        {
          url: "/_next/static/media/aa016aab0e6d1295-s.woff2",
          revision: "49215a3bccaeb5d483f4cf8fceb24776",
        },
        {
          url: "/_next/static/media/b66cf8e69499582a-s.woff2",
          revision: "dea7cff2e11a000dc4e0e913992f9c21",
        },
        {
          url: "/_next/static/media/b9408752a0c24fb9-s.woff2",
          revision: "c10faa6c8fbd7a47d8f00e75e82935cb",
        },
        {
          url: "/_next/static/media/e038a29029a234f2-s.woff2",
          revision: "42a21c981b367f31bd04683072dae1c1",
        },
        {
          url: "/_next/static/media/f639721981034f88-s.woff2",
          revision: "f4a75186954722ca80df35984adf581d",
        },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/icon-source.svg",
          revision: "27276ac2d81b2292fa9aa6e0c2d02193",
        },
        {
          url: "/icons/apple-touch-icon.png",
          revision: "262bdd35cfc6557a1057581002cf84e1",
        },
        {
          url: "/icons/icon-192.png",
          revision: "6cb5466721f2f9469f3bb6e6c9789aee",
        },
        {
          url: "/icons/icon-512-maskable.png",
          revision: "202a59cbedd7fe4aad31b6981ffa1879",
        },
        {
          url: "/icons/icon-512.png",
          revision: "202a59cbedd7fe4aad31b6981ffa1879",
        },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        {
          url: "/splash/apple-splash-1125-2436.png",
          revision: "95db5f3d88145a47c153a76e318f478d",
        },
        {
          url: "/splash/apple-splash-1170-2532.png",
          revision: "587f8b7d51c5c391f2eadb2c367dc50f",
        },
        {
          url: "/splash/apple-splash-1179-2556.png",
          revision: "b66dc2e8b972a1ad56feb7788e384161",
        },
        {
          url: "/splash/apple-splash-1242-2208.png",
          revision: "c87afb6fcd84fc7c8b877c5e164147c9",
        },
        {
          url: "/splash/apple-splash-1242-2688.png",
          revision: "b08a63e0af7012a6b299f87cf14389e8",
        },
        {
          url: "/splash/apple-splash-1284-2778.png",
          revision: "f05a11594f7272536d06d8bfc7191e77",
        },
        {
          url: "/splash/apple-splash-1290-2796.png",
          revision: "6f512a9d0cfcd8289515f8be1b0f4fbc",
        },
        {
          url: "/splash/apple-splash-1536-2048.png",
          revision: "b618d471fb91315550ed0a176d018c4d",
        },
        {
          url: "/splash/apple-splash-1620-2160.png",
          revision: "cfdc999e7e4ca9e2432efd2522ba680a",
        },
        {
          url: "/splash/apple-splash-1668-2224.png",
          revision: "f341a5a9b48ceb7fb03f867e7320a119",
        },
        {
          url: "/splash/apple-splash-1668-2388.png",
          revision: "3982024f3cc1e23e3d6b4e0406b70cd4",
        },
        {
          url: "/splash/apple-splash-2048-2732.png",
          revision: "cefee9619b1b2f91dc3a24e64a0eef23",
        },
        {
          url: "/splash/apple-splash-640-1136.png",
          revision: "1ebd9ffae30f3a3053631adbc151f23b",
        },
        {
          url: "/splash/apple-splash-750-1334.png",
          revision: "65360e082441d7005d8c3db24920f588",
        },
        {
          url: "/splash/apple-splash-828-1792.png",
          revision: "8f2251c73d010204179ed2e882c57599",
        },
        {
          url: "/swe-worker-5c72df51bb1f6ee0.js",
          revision: "76fdd3369f623a3edcf74ce2200bfdd0",
        },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
        {
          url: "/worker-2286d8bc9e24aab5.js",
          revision: "bd1b908ae2c0904ef5ffda7e7cff0701",
        },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && "opaqueredirect" === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: "OK",
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: "next-static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: s } }) =>
        !(!e || s.startsWith("/api/auth/callback") || !s.startsWith("/api/")),
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: a }) =>
        "1" === e.headers.get("RSC") &&
        "1" === e.headers.get("Next-Router-Prefetch") &&
        a &&
        !s.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages-rsc-prefetch",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: s }, sameOrigin: a }) =>
        "1" === e.headers.get("RSC") && a && !s.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages-rsc",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: s }) => s && !e.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET",
    ));
});
