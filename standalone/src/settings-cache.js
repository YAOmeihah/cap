import { db } from "./db.js";

let _headers = null;
let _ratelimit = null;

export async function loadHeaders() {
  const raw = await db.get("settings:headers");
  _headers = raw ? JSON.parse(raw) : { ipHeader: "", countryHeader: "", asnHeader: "" };
  return _headers;
}

export function getHeaders() {
  return _headers;
}

export function setHeaders(settings) {
  _headers = settings;
}

export async function loadRatelimit() {
  const raw = await db.get("settings:ratelimit");
  _ratelimit = raw ? JSON.parse(raw) : { max: 30, duration: 5000 };
  return _ratelimit;
}

export function getRatelimit() {
  return _ratelimit || { max: 30, duration: 5000 };
}

export function setRatelimit(settings) {
  _ratelimit = settings;
}

let _corsDefault = null;

export async function loadCorsDefault() {
  const raw = await db.get("settings:cors");
  _corsDefault = raw ? JSON.parse(raw) : { origins: null };
  return _corsDefault;
}

export function getCorsDefault() {
  return _corsDefault || { origins: null };
}

export function setCorsDefault(settings) {
  _corsDefault = settings;
}

let _filtering = null;

export async function loadFiltering() {
  const raw = await db.get("settings:filtering");
  _filtering = raw ? JSON.parse(raw) : { blockNonBrowserUA: false, requiredHeaders: [] };
  return _filtering;
}

export function getFiltering() {
  return _filtering || { blockNonBrowserUA: false, requiredHeaders: [] };
}

export function setFiltering(settings) {
  _filtering = settings;
}

const _corsCache = new Map();
const CORS_CACHE_TTL = 60_000;

function normalizeCorsOrigin(value) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return null;

  const hasScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(raw);

  try {
    const url = new URL(hasScheme ? raw : `https://${raw}`);
    const origin = url.origin === "null" && hasScheme ? raw : url.origin;
    return { origin, host: url.host.toLowerCase(), hasScheme };
  } catch {
    return {
      origin: raw,
      host: raw.replace(/^[a-z][a-z\d+\-.]*:\/\//i, "").toLowerCase(),
      hasScheme,
    };
  }
}

export function isCorsOriginAllowed(origin, origins) {
  if (!origins || !origins.length) return true;
  if (!origin) return true;

  const from = normalizeCorsOrigin(origin);
  if (!from) return false;

  return origins.some((allowed) => {
    const normalized = normalizeCorsOrigin(allowed);
    if (!normalized) return false;
    if (normalized.hasScheme) return normalized.origin === from.origin;
    return normalized.host === from.host;
  });
}

export async function getCorsOriginsForSiteKey(siteKey) {
  if (!siteKey) return getCorsDefault().origins ?? null;

  const now = Date.now();
  const cached = _corsCache.get(siteKey);
  if (cached && now - cached.ts < CORS_CACHE_TTL) return cached.origins;

  let origins = getCorsDefault().origins ?? null;
  const configStr = await db.hget(`key:${siteKey}`, "config");
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      origins = config.corsOrigins?.length ? config.corsOrigins : origins;
    } catch {}
  }

  _corsCache.set(siteKey, { origins, ts: Date.now() });
  return origins;
}

function applyCorsHeaders(set, request, allowed, methods) {
  const origin = request.headers.get("Origin") || "";
  set.headers.vary = "Origin";
  set.headers["access-control-allow-methods"] = methods.join(", ");

  const requestedHeaders = request.headers.get("access-control-request-headers");
  if (requestedHeaders) {
    set.headers["access-control-allow-headers"] = requestedHeaders;
  }

  if (allowed && origin) {
    set.headers["access-control-allow-origin"] = origin;
  } else if (!allowed) {
    delete set.headers["access-control-allow-origin"];
    delete set.headers["Access-Control-Allow-Origin"];
  }
}

export async function enforceCorsForSiteKey(request, set, siteKey, methods = ["POST"]) {
  const origins = await getCorsOriginsForSiteKey(siteKey);
  const allowed = isCorsOriginAllowed(request.headers.get("Origin"), origins);
  applyCorsHeaders(set, request, allowed, methods);
  return allowed;
}

export async function handleCorsPreflightForSiteKey(request, set, siteKey, methods = ["POST"]) {
  const allowed = await enforceCorsForSiteKey(request, set, siteKey, methods);
  return new Response(null, { status: allowed ? 204 : 403 });
}

export function invalidateCorsCache(siteKey) {
  if (siteKey) {
    _corsCache.delete(siteKey);
  } else {
    _corsCache.clear();
  }
}
