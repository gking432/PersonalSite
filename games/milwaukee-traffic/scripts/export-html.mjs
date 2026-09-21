import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve("dist");
let html = await readFile(resolve(root, "index.html"), "utf8");
for (const match of [
  ...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g),
]) {
  const code = await readFile(resolve(root, match[1]), "utf8");
  html = html.replace(
    match[0],
    () =>
      `<script type="module">${code.replace(/<\/script/gi, "<\\/script")}</script>`,
  );
}
for (const match of [
  ...html.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g),
]) {
  const css = await readFile(resolve(root, match[1]), "utf8");
  html = html.replace(
    match[0],
    () => `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>`,
  );
}
await writeFile(resolve(root, "Milwaukee Traffic.html"), html);
await writeFile(resolve("Milwaukee Traffic.html"), html);
console.log("Standalone file: Milwaukee Traffic.html (also copied to dist)");
