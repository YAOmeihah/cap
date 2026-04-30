import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

const styles = await readFile("public/assets/style.css", "utf-8");

assert.match(
  styles,
  /\.time-select\s*\{[^}]*color-scheme:\s*dark;/s,
  "time range select should ask the browser for dark native menu controls",
);

assert.match(
  styles,
  /\.time-select option\s*\{[^}]*background:\s*var\(--surface-raised\);[^}]*color:\s*var\(--text\);/s,
  "time range dropdown options should stay readable on the dark dashboard",
);
