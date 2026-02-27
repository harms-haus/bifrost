import { describe, it, expect } from "vitest";
import config from "./vite.config";

describe("vite.config.ts", () => {
  it("has correct base path", () => {
    expect(config.base).toBe("/ui");
  });

  it("has required plugins", () => {
    expect(config.plugins).toBeDefined();
    expect(config.plugins.length).toBe(4);

    const pluginNames = config.plugins.map((p: any) => {
      return p.name || p.api?.name || "";
    });

    // Check for vike plugin
    expect(
      pluginNames.some((name: string) => name.includes("vike")),
    ).toBe(true);

    // Check for react plugin
    expect(
      pluginNames.some((name: string) => name.includes("react")),
    ).toBe(true);

    // Check for tailwind plugin
    expect(
      pluginNames.some((name: string) => name.includes("tailwind")),
    ).toBe(true);

    // Check for tsconfig-paths plugin
    expect(
      pluginNames.some((name: string) => name.includes("tsconfig-paths")),
    ).toBe(true);
  });

  it("has server configuration", () => {
    expect(config.server).toBeDefined();
  });

  it("has proxy configuration", () => {
    expect(config.server?.proxy).toBeDefined();
    const proxy = config.server!.proxy as Record<string, unknown>;

    // Check for API endpoints
    expect(proxy["/health"]).toBeDefined();
    expect(proxy["/runes"]).toBeDefined();
    expect(proxy["/rune"]).toBeDefined();
    expect(proxy["/realms"]).toBeDefined();
    expect(proxy["/realm"]).toBeDefined();
    expect(proxy["/accounts"]).toBeDefined();
    expect(proxy["/account"]).toBeDefined();

    // Check for auth endpoints
    expect(proxy["/ui/login"]).toBeDefined();
    expect(proxy["/ui/logout"]).toBeDefined();
    expect(proxy["/ui/session"]).toBeDefined();
    expect(proxy["/ui/check-onboarding"]).toBeDefined();

    // Verify proxy target
    const loginProxy = proxy["/ui/login"] as Record<string, unknown>;
    expect(loginProxy.target).toBe("http://localhost:8080");

    // Verify bypass function for /ui/login
    expect(loginProxy.bypass).toBeDefined();
    expect(typeof loginProxy.bypass).toBe("function");

    // Verify changeOrigin and cookieDomainRewrite
    expect(loginProxy.changeOrigin).toBe(true);
    expect(loginProxy.cookieDomainRewrite).toEqual({ "*": "" });
  });

  it("has strict port enabled", () => {
    expect(config.server?.strictPort).toBe(true);
  });
});
