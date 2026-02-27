import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

describe("tsconfig.json", () => {
  it("should exist", () => {
    expect(() => {
      readFileSync("./tsconfig.json", "utf-8");
    }).not.toThrow();
  });

  it("should have strict mode enabled", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.strict).toBe(true);
  });

  it("should have target ES2022", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.target).toBe("ES2022");
  });

  it("should have module set to ES2022", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.module).toBe("ES2022");
  });

  it("should have moduleResolution set to Bundler", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.moduleResolution).toBe("Bundler");
  });

  it("should have jsx set to react-jsx", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.jsx).toBe("react-jsx");
  });

  it("should have jsxImportSource set to react", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.jsxImportSource).toBe("react");
  });

  it("should have path alias @/components/*", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.paths["@/components/*"]).toEqual([
      "components/*",
    ]);
  });

  it("should have path alias @/lib/*", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.paths["@/lib/*"]).toEqual(["lib/*"]);
  });

  it("should have path alias @/types/*", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.paths["@/types/*"]).toEqual(["types/*"]);
  });

  it("should have path alias @/theme/*", () => {
    const config = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
    expect(config.compilerOptions.paths["@/theme/*"]).toEqual(["theme/*"]);
  });
});
