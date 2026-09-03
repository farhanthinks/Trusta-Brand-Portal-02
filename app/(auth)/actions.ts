"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginSchema, signUpSchema, type LoginInput, type SignUpInput } from "@/lib/validations/auth";
import { logActivity } from "@/lib/admin/activity";
import { startSession, getActiveSessionId, endSession } from "@/lib/admin/sessions";

export interface AuthActionResult {
  error?: string;
  checkEmail?: boolean;
}

export async function signUp(input: SignUpInput): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Could not create account. Please try again." };
  }

  // Create the brand row server-side (trusted, not attacker-controlled)
  // regardless of whether email confirmation gates the session yet.
  const admin = createAdminClient();
  const { error: brandError } = await admin
    .from("brands")
    .insert({ user_id: data.user.id, status: "registered" });

  if (brandError && !brandError.message.includes("duplicate")) {
    return { error: "Account created, but brand setup failed. Contact support." };
  }

  if (!data.session) {
    return { checkEmail: true };
  }

  redirect("/onboarding");
}

export async function login(input: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Could not sign in. Please try again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_suspended")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.is_suspended) {
    await supabase.auth.signOut();
    return { error: "Your account has been suspended. Contact support." };
  }

  // Sequential, not Promise.all: startSession() must set the session
  // cookie before logActivity() reads it, or the login event would race
  // and log against a stale (or no) session id.
  await startSession(data.user.id);
  await logActivity(data.user.id, "login", { email: data.user.email });

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const sessionId = await getActiveSessionId();
    const closed = await endSession(sessionId);
    if (closed) await logActivity(user.id, "logout", {}, sessionId);
  }

  await supabase.auth.signOut();
  redirect("/login");
}
