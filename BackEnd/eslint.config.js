const js = require("@eslint/js");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
js.configs.recommended,
  {
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
  },
  prettierConfig,
];
