// One-time script to create the internal admin account and flag it as admin
// in public.profiles. Run after migrations have been applied:
//
//   node scripts/seed-admin.mjs
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set
// (loaded from .env.local automatically).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    ".env.local"
  );
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch {
    // .env.local not found — assume env vars are already set in the shell.
  }
}

loadEnvLocal();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@trusta.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "admin@123";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local first."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  let userId;

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

  if (createError) {
    if (!createError.message?.toLowerCase().includes("already")) {
      throw createError;
    }
    console.log(`User ${ADMIN_EMAIL} already exists, looking it up...`);
    const { data: list, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    const existing = list.users.find((u) => u.email === ADMIN_EMAIL);
    if (!existing) throw new Error("Could not find existing admin user.");
    userId = existing.id;
  } else {
    userId = created.user.id;
    console.log(`Created auth user ${ADMIN_EMAIL} (${userId}).`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, email: ADMIN_EMAIL, is_admin: true });

  if (profileError) throw profileError;

  console.log(`✔ ${ADMIN_EMAIL} is now flagged is_admin = true.`);
  console.log(`  Login at /login with password: ${ADMIN_PASSWORD}`);
  console.log("  Change this password before going to production.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
