// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import vitest from "@vitest/eslint-plugin";



export default [
  {
    ignores: ["**/*.js"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  perfectionist.configs["recommended-natural"],
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/restrict-template-expressions": ["error", {
        allowNumber: true
      }]
    }
  }
];
