/**
 * End-to-end smoke test for the configured database:
 * sign in -> seed verified content -> read admin lists -> read public APIs -> sign out.
 * Reads credentials from .env.local; prints no secrets.
 *
 * Usage: node scripts/check-admin-flow.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { askHidden } from "./lib/prompt.mjs";

const BASE = process.env.APP_BASE_URL || "http://127.0.0.1:3100";

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

loadEnv(resolve(process.cwd(), ".env.local"));

const email = process.env.ADMIN_EMAIL;

if (!email) {
  console.error("ADMIN_EMAIL is missing from .env.local");
  process.exit(1);
}

const password =
  process.env.ADMIN_PASSWORD || (await askHidden(`Password for ${email} (hidden): `, "ADMIN_PASSWORD"));

async function call(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Non-JSON response.
  }
  return { status: response.status, json, text, headers: response.headers };
}

console.log(`Base URL: ${BASE}`);

const login = await call("/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
console.log(`Login: ${login.status} ${login.json?.message ?? ""}`);

const setCookies =
  typeof login.headers.getSetCookie === "function"
    ? login.headers.getSetCookie()
    : [login.headers.get("set-cookie")].filter(Boolean);
const cookie = setCookies
  .map((value) => value.split(";")[0])
  .filter(Boolean)
  .join("; ");

if (login.status !== 200 || !cookie) {
  console.error("Login failed; cannot continue.");
  console.error(login.text.slice(0, 400));
  process.exit(1);
}
console.log(`Session cookie: ${cookie.split("=")[0]}=…`);

const seed = await call("/api/admin/seed", {
  method: "POST",
  headers: { Cookie: cookie },
});
console.log(`Seed: ${seed.status} ${JSON.stringify(seed.json?.data ?? seed.json ?? {})}`);

for (const entity of ["gallery", "activities", "members"]) {
  const result = await call(`/api/admin/${entity}`, { headers: { Cookie: cookie } });
  const count = Array.isArray(result.json?.data) ? result.json.data.length : "?";
  console.log(`Admin ${entity}: ${result.status}, ${count} record(s)`);
}

for (const entity of ["gallery", "activities", "members"]) {
  const result = await call(`/api/${entity}`);
  console.log(
    `Public ${entity}: ${result.status}, total=${result.json?.meta?.total ?? "?"}, source=${result.json?.meta?.source ?? "?"}`
  );
}

const logout = await call("/api/admin/logout", {
  method: "POST",
  headers: { Cookie: cookie },
});
console.log(`Logout: ${logout.status} ${logout.json?.message ?? ""}`);

const afterLogout = await call("/api/admin/gallery", { headers: { Cookie: cookie } });
console.log(
  `Admin gallery with the old cookie: ${afterLogout.status} ` +
    "(logout clears the browser cookie; the signed token itself expires after 8h)"
);
