import { cloudflare } from "@cloudflare/vite-plugin";
import babelPlugin from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
  preview: { port: 4173 },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      persistState: { path: ".wrangler" },
    }),
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babelPlugin({ presets: [reactCompilerPreset()] }),
  ],
});

export default config;
