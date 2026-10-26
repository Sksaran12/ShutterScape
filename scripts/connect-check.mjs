/**
 * Connection diagnostics for the ShutterScape Atlas cluster and Cloudinary.
 * Reads .env.local if present, otherwise .env.local.example (template).
 * Secrets are masked; the URI is never printed.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";

function loadEnv(path) {
  if (!existsSync(path)) return false;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
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
  return true;
}

const envFile = [".env.local", ".env"].find((file) => existsSync(resolve(file))) ??
  (existsSync(resolve(".env.local.example")) ? ".env.local.example" : null);

console.log(`Env file used: ${envFile ?? "(none found)"}`);
if (envFile) loadEnv(resolve(envFile));

function mask(value) {
  if (!value) return "(missing)";
  if (value.length <= 6) return `(set, length ${value.length})`;
  return `(set, length ${value.length}, starts ${value.slice(0, 2)}…)`;
}

for (const key of [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "ADMIN_EMAIL",
]) {
  console.log(`${key}: ${mask(process.env[key])}`);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("\nMongoDB: MONGODB_URI missing.");
} else {
  console.log("\n--- MongoDB connection test ---");
  let client;
  try {
    const parsed = new URL(uri);
    console.log(`Scheme: ${parsed.protocol.replace(":", "")}`);
    console.log(`Host: ${parsed.host}`);
    console.log(
      `Database in URI: ${parsed.pathname.replace(/^\//, "") || "(none — Atlas defaults to 'test')"}`
    );
    console.log(
      `Options: ${[...parsed.searchParams.keys()].join(", ") || "(none — add retryWrites=true&w=majority)"}`
    );

    client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
    await client.connect();
    const ping = await client.db("admin").command({ ping: 1 });
    console.log(`Ping: ${ping.ok === 1 ? "OK" : "unexpected response"}`);

    try {
      const dbs = await client.db("admin").admin().listDatabases();
      console.log(
        `Visible databases: ${dbs.databases.map((db) => db.name).join(", ")}`
      );
    } catch (error) {
      console.log(`listDatabases not permitted: ${error.message}`);
    }

    for (const dbName of ["shutterscape", "test"]) {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      console.log(
        `\nDatabase "${dbName}": ${collections.length} collection(s) ${collections.length ? `(${collections.map((c) => c.name).join(", ")})` : ""}`
      );
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  ${collection.name}: ${count} document(s)`);
      }
      if (dbName === "shutterscape") {
        const admins = await db
          .collection("admins")
          .find({}, { projection: { email: 1, role: 1 } })
          .toArray()
          .catch(() => []);
        if (admins.length) {
          console.log(
            `  Admin accounts: ${admins.map((a) => `${a.email} (${a.role ?? "admin"})`).join(", ")}`
          );
        }
      }
    }
  } catch (error) {
    console.log(`MongoDB error: ${error.message}`);
    if (/querySrv|ENOTFOUND|ETIMEOUT|ECONNREFUSED|Could not connect/i.test(error.message)) {
      console.log(
        "Hint: check the Atlas Network Access allowlist and that the cluster hostname/user/password are correct."
      );
    }
    if (/bad auth|Authentication failed/i.test(error.message)) {
      console.log("Hint: the database username or password is incorrect.");
    }
  } finally {
    if (client) await client.close().catch(() => {});
  }
}

// --- Cloudinary ---
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("\n--- Cloudinary connection test ---");
if (!cloudName || !apiKey || !apiSecret) {
  console.log("Cloudinary: one or more variables are missing.");
} else {
  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const ping = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/ping`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    console.log(`Ping: ${ping.status} ${ping.statusText}`);
    console.log(`Body: ${(await ping.text()).slice(0, 120)}`);

    const usageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/usage`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (usageResponse.ok) {
      const usage = await usageResponse.json();
      console.log(
        `Usage: plan=${usage.plan ?? "?"} credits=${usage.credits?.usage ?? "?"}/${usage.credits?.limit ?? "?"} resources=${usage.resources ?? "?"}`
      );
    } else {
      console.log(`Usage endpoint: ${usageResponse.status} ${usageResponse.statusText}`);
    }
  } catch (error) {
    console.log(`Cloudinary error: ${error.message}`);
  }
}
