import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf-8");

const i18n = await read("public/js/i18n.js");
const index = await read("public/index.html");
const login = await read("public/login.html");
const styles = await read("public/assets/style.css");
const staticServer = await read("src/static.js");

assert.match(i18n, /const STORAGE_KEY = "cap_locale"/);
assert.match(i18n, /const DEFAULT_LOCALE = "zh-CN"/);
assert.match(i18n, /window\.CapI18n = /);
assert.match(i18n, /"New key": "新建密钥"/);
assert.match(i18n, /"Search keys\.\.\.": "搜索密钥\.\.\."/);
assert.match(i18n, /"Continue to Cap": "继续进入 Cap"/);
assert.match(i18n, /MutationObserver/);

assert.match(index, /data-cap-locale-switch/);
assert.match(index, /data-cap-locale-option="zh-CN"/);
assert.match(index, /data-cap-locale-option="en"/);
assert.match(index, /public\/js\/i18n\.js/);

assert.match(login, /data-cap-locale-switch/);
assert.match(login, /data-cap-locale-option="zh-CN"/);
assert.match(login, /data-cap-locale-option="en"/);
assert.match(login, /public\/js\/i18n\.js/);
assert.match(login, /innerText = "Incorrect admin key"/);
assert.match(login, /CapI18n\?\.apply\(document\.querySelector\("p\.err"\)\)/);

assert.match(styles, /\.locale-switch/);
assert.match(styles, /\.locale-switch button\.active/);

assert.match(staticServer, /"js\/i18n\.js"/);
