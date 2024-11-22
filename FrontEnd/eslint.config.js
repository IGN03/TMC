const globals = require("globals");
const js = require("@eslint/js");
const ts = require("typescript-eslint");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      semi: "error",
      "prefer-const": "error",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  prettierConfig,
];
