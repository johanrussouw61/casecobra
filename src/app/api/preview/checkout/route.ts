"use server";
import { NextResponse, NextRequest } from "next/server";
import { createCheckoutSession } from "@/app/configure/preview/actions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { configId, userEmail } = body as {
      configId: string;
      userEmail: string;
    };

    if (!configId) {
      return new NextResponse("Missing configId", { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "You need to be logged in" },
        { status: 401 }
      );
    }

    const result = await createCheckoutSession({
      configId,
      userEmail,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? "Unknown error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
