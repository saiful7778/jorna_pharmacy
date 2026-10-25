//  @ts-check
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import eslintReact from "@eslint-react/eslint-plugin";
import { tanstackConfig } from "@tanstack/eslint-config";
import pluginReactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";

export default [
  {
    ignores: [
      "eslint.config.js",
      ".prettierrc",
      "worker-configuration.d.ts",
      ".opencode",
      ".storybook",
      "storybook-static",
      "dist",
      ".output",
      ".wrangler",
      "src/routeTree.gen.ts",
    ],
  },
  ...tanstackConfig,
  {
    files: ["**/*.{ts,tsx}"],
    ...eslintReact.configs["recommended-typescript"],
  },
  pluginReactHooks.configs.flat.recommended,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "import/consistent-type-specifier-style": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
];
