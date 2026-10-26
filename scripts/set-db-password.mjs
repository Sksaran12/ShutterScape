/**
 * Updates the MongoDB Atlas password inside .env.local safely.
 *
 * Why this script exists: Atlas passwords that contain @ : / ? # [ ] % must be
 * percent-encoded inside a connection string. Typing those by hand is the most
 * common cause of "bad auth : authentication failed".
 *
 * Usage (run in your own terminal):
 *   node scripts/set-db-password.mjs
 *   node scripts/set-db-password.mjs --user NewUser
 *
 * The password is typed with echo off and never appears in shell history.
 * For automation, set NEW_DB_PASSWORD in the environment instead.
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";
import { askHidden } from "./lib/prompt.mjs";

const ENV_PATH = resolve(process.cwd(), ".env.local");

function argValue(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function splitUri(uri) {
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:@/]+):(.*)@([^@/]+)$/s);
  if (!match) return null;
  return { scheme: match[1], user: match[2], host: match[4] };
}

async function canConnect(uri) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  } finally {
    await client.close().catch(() => {});
  }
}

async function main() {
  if (!existsSync(ENV_PATH)) {
    console.error(".env.local not found. Run this from the project root.");
    process.exit(1);
  }

  const envText = readFileSync(ENV_PATH, "utf8");
  const uriLine = envText.split(/\r?\n/).find((line) => /^\s*MONGODB_URI\s*=/.test(line));
  if (!uriLine) {
    console.error("MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  let currentUri = uriLine.slice(uriLine.indexOf("=") + 1).trim();
  if (
    (currentUri.startsWith('"') && currentUri.endsWith('"')) ||
    (currentUri.startsWith("'") && currentUri.endsWith("'"))
  ) {
    currentUri = currentUri.slice(1, -1);
  }

  const parts = splitUri(currentUri);
  if (!parts) {
    console.error("Could not parse MONGODB_URI in .env.local. Expected mongodb+srv://user:password@host/db");
    process.exit(1);
  }

  const user = argValue("user") || parts.user;
  console.log(`Cluster: ${parts.host}`);
  console.log(`Database user: ${user}`);

  const password = await askHidden("New Atlas password (hidden): ", "NEW_DB_PASSWORD");
  if (!password) {
    console.error("Empty password. Nothing changed.");
    process.exit(1);
  }

  const candidate = `${parts.scheme}${user}:${encodeURIComponent(password)}@${parts.host}`;
  process.stdout.write("Testing the new password… ");
  const test = await canConnect(candidate);

  if (!test.ok) {
    console.log("FAILED");
    console.error(`Atlas said: ${test.message}`);
    console.error(
      "Nothing was written. Check the password in Atlas → Database Access, and that this IP is allow-listed."
    );
    process.exit(1);
  }

  console.log("OK");

  copyFileSync(ENV_PATH, `${ENV_PATH}.bak`);
  const updated = envText.replace(
    /^(\s*MONGODB_URI\s*=).*$/m,
    (_line, prefix) => `${prefix}${candidate}`
  );
  writeFileSync(ENV_PATH, updated, "utf8");

  console.log("Updated MONGODB_URI in .env.local (backup: .env.local.bak)");
  console.log("Restart the dev/production server so it picks up the new value.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
