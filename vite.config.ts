import { copyFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";

/** Set to `/your-repo-name/` when deploying to GitHub Project Pages. */
export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "gh-pages-spa-fallback",
      closeBundle() {
        copyFileSync(join("dist", "index.html"), join("dist", "404.html"));
      },
    },
  ],
});
