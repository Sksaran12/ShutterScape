/**
 * Creates an admin account or REPLACES the password of an existing one.
 *
 * Usage (run in your own terminal, from the project folder):
 *   node scripts/set-admin-password.mjs                 # choose your own password
 *   node scripts/set-admin-password.mjs --generate      # random strong password
 *   node scripts/set-admin-password.mjs --list          # show admin accounts
 *   node scripts/set-admin-password.mjs --email you@example.com
 *
 * The password is typed with echo off, hashed with bcrypt (cost 12) and never
 * written to disk. No ADMIN_PASSWORD entry in .env.local is needed or used.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { askHidden } from "./lib/prompt.mjs";

const MIN_LENGTH = 12;
const MAX_LENGTH = 200;

function loadEnvFile() {
  let content;
  try {
    content = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  } catch {
    return;
  }
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
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

function argValue(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hashedPassword: { type: String, required: true },
    role: { type: String, default: "admin", enum: ["admin"] },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function main() {
  loadEnvFile();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected to MongoDB");

  const admins = await Admin.find({}, { email: 1, role: 1 }).lean();

  if (hasFlag("list")) {
    if (!admins.length) console.log("No admin accounts yet.");
    for (const admin of admins) console.log(`- ${admin.email} (${admin.role ?? "admin"})`);
    await mongoose.disconnect();
    return;
  }

  let email = argValue("email")?.trim().toLowerCase();
  if (!email) {
    if (admins.length === 1) {
      email = admins[0].email;
      console.log(`Using the only existing admin: ${email}`);
    } else if (admins.length === 0) {
      console.error("No admin exists yet. Pass --email you@example.com to create one.");
      await mongoose.disconnect();
      process.exit(1);
    } else {
      console.error("Several admins exist. Pass --email to choose one:");
      for (const admin of admins) console.error(`  ${admin.email}`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`"${email}" is not a valid email address.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  let password;
  if (hasFlag("generate")) {
    password = randomBytes(18).toString("base64url");
  } else {
    password = await askHidden(`New password for ${email} (hidden): `, "NEW_ADMIN_PASSWORD");
    const again = await askHidden("Repeat the password (hidden): ", "NEW_ADMIN_PASSWORD");
    if (password !== again) {
      console.error("Passwords do not match. Nothing changed.");
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  if (password.length < MIN_LENGTH || password.length > MAX_LENGTH) {
    console.error(
      `Password must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters (got ${password.length}). Nothing changed.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const existing = await Admin.findOne({ email });

  if (existing) {
    existing.hashedPassword = hashedPassword;
    await existing.save();
    console.log(`Password replaced for ${email} (no new account was created).`);
  } else {
    await Admin.create({ email, hashedPassword, role: "admin" });
    console.log(`Admin account created: ${email}`);
  }

  // Prove the stored hash accepts the new password before finishing.
  const stored = await Admin.findOne({ email }).lean();
  const verified = await bcrypt.compare(password, stored.hashedPassword);
  console.log(`Hash verification: ${verified ? "OK" : "FAILED"}`);

  if (hasFlag("generate")) {
    console.log("");
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log("Save it now — it is not stored anywhere in plain text.");
  } else {
    console.log("Nothing was written to disk; only the bcrypt hash is in MongoDB.");
  }

  console.log("");
  console.log(
    "Existing browser sessions stay valid until they expire (8h); sign out, or rotate NEXTAUTH_SECRET to revoke all."
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  if (/bad auth|authentication failed/i.test(error.message)) {
    console.error("MongoDB rejected the credentials in .env.local.");
    console.error("Run: node scripts/set-db-password.mjs");
  } else {
    console.error(error);
  }
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
