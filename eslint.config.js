//  @ts-check
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { tanstackConfig } from "@tanstack/eslint-config";
import storybook from "eslint-plugin-storybook";

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "import/consistent-type-specifier-style": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    ignores: [
      "eslint.config.js",
      ".prettierrc",
      "worker-configuration.d.ts",
      ".opencode",
      ".storybook",
    ],
  },
  ...storybook.configs["flat/recommended"],
];
