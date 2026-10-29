// Builds each bookmarklets/src/*.js into a one-line `javascript:` file next to it.
// Usage: node bookmarklets/build.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SRC_DIR = new URL("./src/", import.meta.url);
const OUT_DIR = new URL("./", import.meta.url);

// Drops blank lines and full-line `//` comments, trims each line, and joins them with no separator.
// The source must end every statement with a semicolon for the joined line to stay valid.
export function minify(source) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .join("");
}

export function bookmarklet(source) {
  return `javascript:${minify(source)}\n`;
}

function build(name) {
  const output = bookmarklet(readFileSync(new URL(name, SRC_DIR), "utf8"));
  if (output.includes("%")) {
    throw new Error(`${name}: output contains "%", which Chrome percent-decodes inside a javascript: URL`);
  }
  new vm.Script(output.slice("javascript:".length), { filename: name });
  writeFileSync(new URL(name, OUT_DIR), output);
  console.log(`built ${name} (${output.length - 1} chars)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  readdirSync(SRC_DIR).filter((name) => name.endsWith(".js")).forEach(build);
}
