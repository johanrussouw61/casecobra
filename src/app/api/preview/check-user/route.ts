import { NextResponse } from "next/server";
import { checkUserInDb } from "@/app/configure/preview/actions";

export async function POST() {
  try {
    await checkUserInDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return new NextResponse(`Error checking user ${err}`, {
      status: 400,
    });
  }
}
