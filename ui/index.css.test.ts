import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Global Styles - Neo-Brutalist Override', () => {
  describe('index.css should override Base UI rounded corners', () => {
    it('should contain border-radius: 0 for all components', () => {
      const cssPath = join(__dirname, '../index.css');
      const cssContent = readFileSync(cssPath, 'utf-8');

      // Check for global border-radius: 0 override
      const hasGlobalRadiusZero = cssContent.includes('border-radius: 0');
      expect(hasGlobalRadiusZero, 'Global border-radius: 0 not found').toBe(true);

      // Check for !important to ensure it overrides Base UI defaults
      const hasImportant = cssContent.includes('border-radius: 0 !important');
      expect(hasImportant, 'border-radius: 0 should use !important to override Base UI').toBe(true);
    });

    it('should have bold borders (2px)', () => {
      const cssPath = join(__dirname, '../index.css');
      const cssContent = readFileSync(cssPath, 'utf-8');

      // Check for bold border-width
      const hasBoldBorders = cssContent.includes('border-width: 2px') || cssContent.includes('border: 2px');
      expect(hasBoldBorders, 'Bold borders (2px) not found').toBe(true);
    });

    it('should have soft shadows with low spread', () => {
      const cssPath = join(__dirname, '../index.css');
      const cssContent = readFileSync(cssPath, 'utf-8');

      // Check for soft shadow with low spread (e.g., 0px 4px 6px rgba...)
      const hasSoftShadow = cssContent.includes('box-shadow') &&
        (cssContent.includes('rgba') || cssContent.includes('rgb'));
      expect(hasSoftShadow, 'Soft shadows not found').toBe(true);
    });

    it('should include Tailwind directives', () => {
      const cssPath = join(__dirname, '../index.css');
      const cssContent = readFileSync(cssPath, 'utf-8');

      // Check for Tailwind directives
      expect(cssContent, 'Tailwind @tailwind directives not found').toContain('@tailwind');
    });
  });

  describe('pages/+custom.css should exist for Vike integration', () => {
    it('should create custom.css file', () => {
      const cssPath = join(__dirname, '../pages/+custom.css');

      expect(() => readFileSync(cssPath, 'utf-8')).not.toThrow();
    });
  });
});
