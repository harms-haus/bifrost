import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// API endpoints to proxy to Go backend
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
  "/ui/login",
  "/ui/logout",
  "/ui/session",
  "/ui/check-onboarding",
  "/ui/onboarding",
];

// Generate proxy configuration for all API paths
const apiProxyConfig = Object.fromEntries(
  apiProxyPaths.map((path) => [
    path,
    {
      target: "http://localhost:8080",
      changeOrigin: true,
    },
  ])
);

export default defineConfig({
  plugins: [vike(), react(), tailwindcss(), tsconfigPaths()],
  base: "/ui/",
  server: {
    strictPort: true,
    proxy: apiProxyConfig,
  },
});
