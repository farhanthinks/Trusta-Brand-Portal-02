"use client";

import { createClient } from "./client";

function extensionOf(file: File): string {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "bin";
}

/** Uploads to the public `brand-logos` bucket and returns a public URL. */
export async function uploadBrandLogo(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/logo-${Date.now()}.${extensionOf(file)}`;

  const { error } = await supabase.storage.from("brand-logos").upload(path, file, {
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("brand-logos").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads to the private `brand-documents` bucket and returns the storage
 * path (not a public URL — the bucket is private). Admins resolve a signed
 * URL from this path when reviewing documents.
 */
export async function uploadVerificationDocument(
  file: File,
  userId: string,
  docType: "business_proof" | "id_proof"
): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/${docType}-${Date.now()}.${extensionOf(file)}`;

  const { error } = await supabase.storage.from("brand-documents").upload(path, file, {
    upsert: true,
  });
  if (error) throw error;

  return path;
}
