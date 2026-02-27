import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";
import type { IncomingMessage } from "http";
import tsconfigPaths from "vite-tsconfig-paths";

// API endpoints to proxy to Go backend
// Note: /ui/* page routes are handled by Vike
const apiProxyPaths = [
  "/health",
  "/runes",
  "/rune",
  "/create-rune",
  "/update-rune",
  "/forge-rune",
  "/claim-rune",
  "/unclaim-rune",
  "/fulfill-rune",
  "/seal-rune",
  "/shatter-rune",
  "/sweep-runes",
  "/add-dependency",
  "/remove-dependency",
  "/add-note",
  "/assign-role",
  "/revoke-role",
  "/realms",
  "/realm",
  "/create-realm",
  "/accounts",
  "/account",
  "/create-account",
  "/suspend-account",
  "/grant-realm",
  "/revoke-realm",
  "/create-pat",
  "/revoke-pat",
  "/pats",
  "/my-stats",
];

// Generate proxy configuration for all API paths
const apiProxyConfig = Object.fromEntries(
  apiProxyPaths.map((path) => [
    path,
    {
      target: "http://localhost:8080",
      changeOrigin: true,
      cookieDomainRewrite: { "*": "" },
    },
  ])
);

// Auth API endpoints - these need special handling because they share paths with pages
// /ui/login POST -> Go backend
// /ui/login GET -> Vike page
const authApiProxyConfig = {
  "/ui/login": {
    target: "http://localhost:8080",
    changeOrigin: true,
    cookieDomainRewrite: { "*": "" },
    bypass: (req: IncomingMessage) => {
      // Only proxy POST requests, let GET requests through to Vike
      if (req.method !== "POST") return req.url;
      return null;
    },
  },
  "/ui/logout": {
    target: "http://localhost:8080",
    changeOrigin: true,
    cookieDomainRewrite: { "*": "" },
  },
  "/ui/session": {
    target: "http://localhost:8080",
    changeOrigin: true,
    cookieDomainRewrite: { "*": "" },
  },
  "/ui/check-onboarding": {
    target: "http://localhost:8080",
    changeOrigin: true,
    cookieDomainRewrite: { "*": "" },
  },
  "/ui/onboarding/create-admin": {
    target: "http://localhost:8080",
    changeOrigin: true,
    cookieDomainRewrite: { "*": "" },
  },
};

export default defineConfig({
  plugins: [vike(), react(), tailwindcss(), tsconfigPaths()],
  base: "/ui",
  server: {
    strictPort: true,
    proxy: {
      ...apiProxyConfig,
      ...authApiProxyConfig,
    },
  },
});
