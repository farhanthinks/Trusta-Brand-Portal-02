import "server-only";
import { createClient } from "./server";
import type { Brand, BrandEntitlement, Profile } from "./types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

export async function getCurrentBrand(): Promise<Brand | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export async function getBrandEntitlements(
  brandId: string
): Promise<BrandEntitlement | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_entitlements")
    .select("*")
    .eq("brand_id", brandId)
    .maybeSingle();

  return data;
}
