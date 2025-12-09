import { NextResponse } from "next/server";
import { checkUserInDb } from "@/app/configure/preview/actions";

export async function POST() {
  try {
    await checkUserInDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = (err as any)?.message ?? String(err ?? "Unknown error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
