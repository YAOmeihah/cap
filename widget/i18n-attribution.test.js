import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

const source = await readFile("src/src/cap.js", "utf-8");
const css = await readFile("src/src/cap.css", "utf-8");
const bundle = await readFile("src/cap.min.js", "utf-8");
const compatBundle = await readFile("src/cap.compat.min.js", "utf-8");
const types = await readFile("src/cap.d.ts", "utf-8");

assert.match(source, /const CAP_WIDGET_LOCALES = /);
assert.match(source, /"initial-state": "验证您是真人"/);
assert.match(source, /"verify-aria-label": "点击验证您是真人"/);
assert.match(source, /"initial-state": "Verify you're human"/);
assert.match(source, /data-cap-lang/);
assert.match(source, /getCapLocale\(\)/);
assert.match(source, /const override = this\.getAttribute\(`data-cap-i18n-\$\{key\}`\)/);

assert.doesNotMatch(source, /part="attribution"/);
assert.doesNotMatch(source, /class="credits"/);
assert.doesNotMatch(source, /trycap\.dev\/\?\$\{new URLSearchParams/);
assert.doesNotMatch(css, /\.captcha \.credits/);

assert.match(bundle, /验证您是真人/);
assert.match(bundle, /点击验证您是真人/);
assert.doesNotMatch(bundle, /part="attribution"/);
assert.doesNotMatch(bundle, /class="credits"/);

assert.match(compatBundle, /验证您是真人/);
assert.match(compatBundle, /data-cap-lang/);
assert.doesNotMatch(compatBundle, /part="attribution"/);
assert.doesNotMatch(compatBundle, /class="credits"/);
assert.doesNotMatch(compatBundle, /https:\/\/trycap\.dev\//);

assert.match(types, /"data-cap-lang"/);
assert.match(types, /"data-cap-i18n-troubleshooting-label"/);
