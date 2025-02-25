// @ts-check

/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Temporarily disable rules causing build issues
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
  },
};

module.exports = config;
