/**
 * End-to-end Cloudinary test through the real admin API:
 * login -> upload a generated PNG -> verify the secure URL -> delete the asset.
 * Secrets are read from .env.local and never printed.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { askHidden } from "./lib/prompt.mjs";

const BASE = "http://127.0.0.1:3100";

for (const rawLine of readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (process.env[m[1]] === undefined) process.env[m[1]] = v;
}

// 2x2 PNG
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
  "base64"
);

const email = process.env.ADMIN_EMAIL || "admin@shutterscape.local";
const password =
  process.env.ADMIN_PASSWORD || (await askHidden(`Password for ${email} (hidden): `, "ADMIN_PASSWORD"));

const login = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const cookie = (login.headers.getSetCookie?.() ?? [login.headers.get("set-cookie")])
  .filter(Boolean)
  .map((c) => c.split(";")[0])
  .join("; ");
console.log(`Login: ${login.status}, cookie: ${cookie ? "yes" : "no"}`);
if (login.status !== 200) {
  console.log(await login.text());
  process.exit(1);
}

const form = new FormData();
form.append("file", new File([png], "shutterscape-upload-test.png", { type: "image/png" }));

const upload = await fetch(`${BASE}/api/admin/upload`, {
  method: "POST",
  headers: { Cookie: cookie },
  body: form,
});
const uploadJson = await upload.json();
console.log(`Upload: ${upload.status}`);
console.log(JSON.stringify(uploadJson, null, 2));

const data = uploadJson?.data;
if (upload.status !== 200 || !data?.url) {
  console.log("Upload failed; skipping delete.");
  process.exit(1);
}

const head = await fetch(data.url, { method: "GET" });
console.log(`Asset reachable: ${head.status}, content-type=${head.headers.get("content-type")}, bytes=${head.headers.get("content-length")}`);

const del = await fetch(`${BASE}/api/admin/upload`, {
  method: "DELETE",
  headers: { Cookie: cookie, "Content-Type": "application/json" },
  body: JSON.stringify({ publicId: data.publicId }),
});
console.log(`Delete: ${del.status} ${await del.text()}`);

const after = await fetch(data.url);
console.log(`Asset after delete: ${after.status} (expected 404)`);
