import { describe, expect, beforeEach } from "vitest";
import test from "vitest-gwt";
import { readFileSync } from "fs";
import { join } from "path";

type Context = {
  css: string;
  cssPath: string;
};

describe("index.css", () => {
  beforeEach(function(this: Context) {
    this.cssPath = join(__dirname, "index.css");
    this.css = readFileSync(this.cssPath, "utf-8");
  });

  test("has required theme color variables", {
    given: {
      css_file_exists,
    },
    when: {
      css_is_read,
    },
    then: {
      includes_color_red,
      includes_color_amber,
      includes_color_green,
      includes_color_blue,
      includes_color_purple,
      includes_color_bg,
      includes_color_text,
      includes_color_border,
    },
  });

  test("has 0% border-radius override", {
    given: {
      css_file_exists,
    },
    when: {
      css_is_read,
    },
    then: {
      includes_border_radius_zero,
    },
  });

  test("has Tailwind directives", {
    given: {
      css_file_exists,
    },
    when: {
      css_is_read,
    },
    then: {
      includes_tailwind_import,
      includes_theme_layer,
    },
  });
});

function css_file_exists(this: Context) {
  expect(this.css).toBeDefined();
}

function css_is_read(this: Context) {
  // Already read in beforeEach
}

function includes_color_red(this: Context) {
  expect(this.css).toContain("--color-red:");
}

function includes_color_amber(this: Context) {
  expect(this.css).toContain("--color-amber:");
}

function includes_color_green(this: Context) {
  expect(this.css).toContain("--color-green:");
}

function includes_color_blue(this: Context) {
  expect(this.css).toContain("--color-blue:");
}

function includes_color_purple(this: Context) {
  expect(this.css).toContain("--color-purple:");
}

function includes_color_bg(this: Context) {
  expect(this.css).toContain("--color-bg:");
}

function includes_color_text(this: Context) {
  expect(this.css).toContain("--color-text:");
}

function includes_color_border(this: Context) {
  expect(this.css).toContain("--color-border:");
}

function includes_border_radius_zero(this: Context) {
  expect(this.css).toContain("border-radius: 0px");
}

function includes_tailwind_import(this: Context) {
  expect(this.css).toContain("@import");
}

function includes_theme_layer(this: Context) {
  expect(this.css).toContain("@layer");
}
