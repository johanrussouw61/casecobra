"use server";
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { checkUserInDb } from "@/app/configure/preview/actions";

export async function POST() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "You need to be logged in" },
        { status: 401 }
      );
    }

    await checkUserInDb(user.email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err ?? "Unknown error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
