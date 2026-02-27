import { describe, expect, beforeEach, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("package.json", () => {
  let packageJson: any;
  let packageJsonPath: string;

  beforeEach(() => {
    packageJsonPath = join(__dirname, "package.json");
    packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  });

  describe("has required dependencies", () => {
    it("includes react", () => {
      expect(packageJson.dependencies.react).toBeDefined();
    });

    it("includes react-dom", () => {
      expect(packageJson.dependencies["react-dom"]).toBeDefined();
    });

    it("includes vike", () => {
      expect(packageJson.dependencies.vike).toBeDefined();
    });

    it("includes vike-react", () => {
      expect(packageJson.dependencies["vike-react"]).toBeDefined();
    });

    it("includes @base-ui/react", () => {
      expect(packageJson.dependencies["@base-ui/react"]).toBeDefined();
    });

    it("includes tailwindcss", () => {
      expect(packageJson.dependencies.tailwindcss).toBeDefined();
    });

    it("includes vitest", () => {
      expect(packageJson.devDependencies.vitest).toBeDefined();
    });

    it("includes @testing-library/react", () => {
      expect(packageJson.devDependencies["@testing-library/react"]).toBeDefined();
    });

    it("includes @testing-library/jest-dom", () => {
      expect(packageJson.devDependencies["@testing-library/jest-dom"]).toBeDefined();
    });

    it("includes @testing-library/user-event", () => {
      expect(packageJson.devDependencies["@testing-library/user-event"]).toBeDefined();
    });

    it("includes oxlint", () => {
      expect(packageJson.devDependencies.oxlint).toBeDefined();
    });

    it("includes typescript", () => {
      expect(packageJson.devDependencies.typescript).toBeDefined();
    });
  });

  describe("has required scripts", () => {
    it("includes dev script", () => {
      expect(packageJson.scripts.dev).toBeDefined();
    });

    it("includes build script", () => {
      expect(packageJson.scripts.build).toBeDefined();
    });

    it("includes test script", () => {
      expect(packageJson.scripts.test).toBeDefined();
    });

    it("includes lint script", () => {
      expect(packageJson.scripts.lint).toBeDefined();
    });

    it("includes format script", () => {
      expect(packageJson.scripts.format).toBeDefined();
    });

    it("includes preview script", () => {
      expect(packageJson.scripts.preview).toBeDefined();
    });
  });

  describe("is set to module type", () => {
    it("has module type", () => {
      expect(packageJson.type).toBe("module");
    });
  });

  describe("does not include forbidden dependencies", () => {
    it("excludes animation libraries", () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      expect(allDeps["framer-motion"]).toBeUndefined();
      expect(allDeps.gsap).toBeUndefined();
      expect(allDeps["@motion/one"]).toBeUndefined();
    });

    it("excludes state management libraries", () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      expect(allDeps.redux).toBeUndefined();
      expect(allDeps.zustand).toBeUndefined();
      expect(allDeps.jotai).toBeUndefined();
      expect(allDeps.recoil).toBeUndefined();
      expect(allDeps.pinia).toBeUndefined();
    });

    it("excludes form libraries", () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      expect(allDeps["react-hook-form"]).toBeUndefined();
      expect(allDeps.formik).toBeUndefined();
      expect(allDeps["react-final-form"]).toBeUndefined();
    });
  });
});
