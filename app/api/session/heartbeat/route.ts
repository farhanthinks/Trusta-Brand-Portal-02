import { NextResponse } from "next/server";
import { touchSession } from "@/lib/admin/sessions";

export async function POST() {
  await touchSession();
  return NextResponse.json({ ok: true });
}
