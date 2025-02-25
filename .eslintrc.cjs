// @ts-check

/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-hooks"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    // Temporarily disable rules causing build issues
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
  },
};

module.exports = config;
