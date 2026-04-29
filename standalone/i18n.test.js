import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = (path) => readFile(path, "utf-8");

const i18n = await read("public/js/i18n.js");
const index = await read("public/index.html");
const login = await read("public/login.html");
const styles = await read("public/assets/style.css");
const staticServer = await read("src/static.js");
const dashboard = await read("public/js/dashboard.js");

assert.match(i18n, /const STORAGE_KEY = "cap_locale"/);
assert.match(i18n, /const DEFAULT_LOCALE = "zh-CN"/);
assert.match(i18n, /window\.CapI18n = /);
assert.match(i18n, /"New key": "新建密钥"/);
assert.match(i18n, /"Search keys\.\.\.": "搜索密钥\.\.\."/);
assert.match(i18n, /"Continue to Cap": "继续进入 Cap"/);
assert.match(i18n, /MutationObserver/);
assert.match(i18n, /attributeFilter: translatedAttributes/);
assert.match(i18n, /shouldSkipNode/);
assert.match(i18n, /hasStoredOriginalAttribute/);
assert.doesNotMatch(i18n, /element\.dataset\[datasetKey\] \|\| element\.getAttribute/);

assert.match(index, /data-cap-locale-switch/);
assert.match(index, /data-cap-locale-option="zh-CN"/);
assert.match(index, /data-cap-locale-option="en"/);
assert.match(index, /public\/js\/i18n\.js\?v=[^"]+"/);

assert.match(login, /data-cap-locale-switch/);
assert.match(login, /data-cap-locale-option="zh-CN"/);
assert.match(login, /data-cap-locale-option="en"/);
assert.match(login, /public\/js\/i18n\.js\?v=[^"]+"/);
assert.match(login, /innerText = "Incorrect admin key"/);
assert.match(login, /CapI18n\?\.apply\(document\.querySelector\("p\.err"\)\)/);

assert.match(styles, /\.locale-switch/);
assert.match(styles, /\.locale-switch button\.active/);

assert.match(staticServer, /"js\/i18n\.js"/);
assert.match(staticServer, /"js\/dashboard\.js"/);
assert.match(staticServer, /no-cache/);
assert.match(staticServer, /set\.headers\["cache-control"\]/);

assert.match(dashboard, /CapI18n\?\.t\("MaxMind license key:"\)/);
assert.match(dashboard, /CapI18n\?\.t\("IPInfo token:"\)/);
assert.match(dashboard, /let ipdbStatus = null/);
assert.match(dashboard, /api\("GET", "\/about"\)/);

const context = {
  window: {},
  document: {
    body: null,
    documentElement: {},
    readyState: "complete",
    addEventListener() {},
  },
};
vm.runInNewContext(i18n, context);

const translate = context.window.CapI18n.t;
const consolePhrases = [
  "Language",
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "Last 3 months",
  "All time",
  "Check our",
  "documentation",
  "for more frameworks and details.",
  "This may cause issues with testing or agent browsers and is not entirely foolproof.",
  "Obfuscation level",
  "Higher obfuscation may result in higher CPU usage.",
  "Override the global rate limit for this key. Leave empty to use the global defaults.",
  "Override the global rate limit for this key. Leave empty to use the global defaults (30 reqs / 5s).",
  "Only these origins will be able to request challenges for this key.",
  "Override the global filtering for this key. Leave unchecked to use global defaults.",
  "Block non-browser user agents",
  "Blocks requests from bots, scripts, and other non-browser clients (e.g. python-requests, curl).",
  "Require browser headers",
  "Block requests missing common browser headers.",
  "Add rule",
  "Reset site secret",
  "No network data yet.",
  "Configure a lookup source in IP data settings to store network data.",
  "No platform data yet.",
  "No OS data yet.",
  "No location data yet.",
  "Configure a lookup source in IP data settings to store location data.",
  "Failed to load map data",
  "No block rules yet",
  "Range",
  "Country",
  "Permanent",
  "Expires Apr 29, 1:05 PM",
  "Add block rule",
  "Type",
  "Country code",
  "Select country...",
  "1 hour",
  "24 hours",
  "7 days",
  "30 days",
  "Validation error",
  "Please check your input values.",
  "Rotate Secret?",
  "This will generate a new secret key. Your existing integrations will stop working until updated.",
  "Rotate",
  "Rotated secret key",
  "Make sure to copy this \u2014 it won\u2019t be shown again.",
  "This will permanently delete this key and all associated data. This cannot be undone.",
  "Key created",
  "Make sure to copy your secret key \u2014 it won\u2019t be shown again.",
  "API key created",
  "Make sure to copy your API key \u2014 it won\u2019t be shown again.",
  "No API keys yet",
  "Current",
  "expires 1 hour ago",
  "\u2022 expires in 4 weeks",
  "abc123... \u2022 created 1 hour ago",
  "Global rate limit",
  "Default rate limit applied to all challenge endpoints. Individual keys can override these values in their configuration.",
  "Requests allowed per window",
  "Time window in milliseconds (e.g. 5000 = 5s)",
  "Only these origins will be able to request challenges. Individual keys can override this.",
  "Block requests that don't look like they come from real browsers. Individual keys can override these defaults.",
  "Set the header your reverse proxy uses to pass the client's real IP. Used for rate limiting, IP tracking, and geo lookups.",
  "Choose how to resolve country and ASN for each IP. Use",
  "headers",
  "if your reverse proxy provides them, or download an",
  "IP database",
  "for automatic lookups.",
  "Header containing the 2-letter ISO country code",
  "Header containing the ASN or network name",
  "Star on GitHub",
  "Updated 1 hour ago",
  "Country: 12.3 MB (loaded)",
  "DB-IP Lite (free, no key needed)",
  "MaxMind GeoLite2 (free, needs license key)",
  "IPInfo (API, needs token)",
  "Your GeoLite2 license key",
  "Your IPInfo API token",
  "Download failed",
  "Updating...",
  "MaxMind license key:",
  "IPInfo token:",
  "Delete IP Database?",
  "This will remove the downloaded IP database files. Country and ASN lookups will stop working unless you have headers configured.",
  "Apr 29, 2026",
  "Apr 29, 1:05 PM",
  "just now",
  "in a moment",
];

for (const phrase of consolePhrases) {
  assert.notEqual(translate(phrase, "zh-CN"), phrase, `${phrase} should translate`);
}

class FakeTextNode {
  constructor(text) {
    this.nodeType = 3;
    this.textContent = text;
    this.parentElement = null;
  }
}

class FakeElement {
  constructor(tagName, children = []) {
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.attributes = new Map();
    for (const child of children) this.appendChild(child);
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
  }

  matches(selector) {
    return selector
      .split(",")
      .map((part) => part.trim().toUpperCase())
      .includes(this.tagName);
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (current.matches(selector)) return current;
      current = current.parentElement;
    }
    return null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  querySelectorAll() {
    return [];
  }
}

const walkNodes = (root) => {
  const nodes = [];
  const visit = (node) => {
    if (node.nodeType === 1) {
      for (const child of node.children) {
        nodes.push(child);
        visit(child);
      }
    }
  };
  visit(root);
  return nodes;
};

const codeText = new FakeTextNode("headers");
const normalText = new FakeTextNode("headers");
const fakeBody = new FakeElement("body", [
  new FakeElement("code", [codeText]),
  new FakeElement("p", [normalText]),
]);

const domContext = {
  window: {},
  localStorage: {
    getItem: () => "zh-CN",
    setItem() {},
  },
  Node: {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
    DOCUMENT_NODE: 9,
    DOCUMENT_FRAGMENT_NODE: 11,
  },
  NodeFilter: {
    SHOW_ELEMENT: 1,
    SHOW_TEXT: 4,
  },
  MutationObserver: class {
    observe() {}
  },
  document: {
    body: fakeBody,
    documentElement: {},
    readyState: "loading",
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    createTreeWalker(root) {
      const nodes = walkNodes(root);
      let index = -1;
      return {
        currentNode: null,
        nextNode() {
          index += 1;
          this.currentNode = nodes[index] || null;
          return Boolean(this.currentNode);
        },
      };
    },
  },
};

vm.runInNewContext(i18n, domContext);
domContext.window.CapI18n.apply(fakeBody);

assert.equal(codeText.textContent, "headers", "code/pre text should not be translated");
assert.equal(normalText.textContent, "请求头", "normal UI text should still be translated");

let raceLocale = "zh-CN";
let raceObserverCallback;
const raceText = new FakeTextNode("New key");
const raceInput = new FakeElement("input");
raceInput.setAttribute("placeholder", "Search keys...");
const raceBody = new FakeElement("body", [
  new FakeElement("button", [raceText]),
  raceInput,
]);

const raceContext = {
  window: {},
  localStorage: {
    getItem: () => raceLocale,
    setItem(_key, value) {
      raceLocale = value;
    },
  },
  Node: domContext.Node,
  NodeFilter: domContext.NodeFilter,
  MutationObserver: class {
    constructor(callback) {
      raceObserverCallback = callback;
    }

    observe() {}
  },
  document: {
    body: raceBody,
    documentElement: {},
    readyState: "complete",
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    createTreeWalker: domContext.document.createTreeWalker,
  },
};

vm.runInNewContext(i18n, raceContext);
assert.equal(raceText.textContent, "新建密钥");
assert.equal(raceInput.getAttribute("placeholder"), "搜索密钥...");

raceLocale = "en";
raceObserverCallback([
  { type: "characterData", target: raceText },
  { type: "attributes", target: raceInput, attributeName: "placeholder" },
]);
raceContext.window.CapI18n.setLocale("en");

assert.equal(raceText.textContent, "New key", "pending zh text mutations should not replace the stored English source");
assert.equal(
  raceInput.getAttribute("placeholder"),
  "Search keys...",
  "pending zh attribute mutations should not replace the stored English source",
);
