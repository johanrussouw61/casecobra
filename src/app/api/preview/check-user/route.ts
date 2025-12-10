"use server";
import { NextResponse, NextRequest } from "next/server";
import { checkUserInDb } from "@/app/configure/preview/actions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail } = body as { userEmail: string };

    if (!userEmail) {
      return NextResponse.json(
        { error: "You need to be logged in" },
        { status: 401 }
      );
    }

    await checkUserInDb(userEmail);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err ?? "Unknown error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
