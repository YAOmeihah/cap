import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf-8");

const assets = await read("src/assets.js");
const cap = await read("src/cap.js");
const settingsCache = await read("src/settings-cache.js");

assert.doesNotMatch(
  assets,
  /@elysiajs\/cors|cors\(\{\s*origin:\s*true/,
  "asset CORS must not install a global permissive CORS hook",
);

assert.match(
  settingsCache,
  /getCorsOriginsForSiteKey/,
  "key CORS should resolve key configuration before deciding",
);
assert.match(
  settingsCache,
  /enforceCorsForSiteKey/,
  "challenge requests should be blocked when Origin is disallowed",
);
assert.match(
  settingsCache,
  /if \(normalized\.hasScheme\) return normalized\.origin === from\.origin;/,
  "full CORS origins should match scheme, host, and port exactly",
);
assert.match(
  settingsCache,
  /return normalized\.host === from\.host;/,
  "host-only CORS entries should continue to match by host",
);
assert.doesNotMatch(
  settingsCache,
  /populateCorsCache\(siteKey\);\s*origins = getCorsDefault\(\)\.origins/s,
  "key CORS must not allow the first request by falling back before loading key config",
);

assert.match(cap, /enforceCorsForSiteKey/);
assert.match(cap, /handleCorsPreflightForSiteKey/);
