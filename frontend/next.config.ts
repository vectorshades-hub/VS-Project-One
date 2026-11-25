import type { NextConfig } from "next";

// The app is served by the custom server in ../backend (Express + Next.js on
// one port), so no API rewrites are needed: /api is handled before Next.js.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Hide the Next.js dev-tools indicator (the floating "N" button).
  devIndicators: false,
  // Dev mode only: let browsers on ANY host/IP load dev resources (JS chunks,
  // HMR). Without this, opening the site via a LAN IP never hydrates and the
  // dashboard stays stuck on its loading placeholders. Next.js rejects a bare
  // "*", so match by segment count: any IPv4 address, and 2-3 label hostnames.
  // (Production mode has no such restriction.)
  allowedDevOrigins: ["*.*.*.*", "*.*", "*.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
