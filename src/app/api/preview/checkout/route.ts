import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/app/configure/preview/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { configId } = body as { configId: string };
    if (!configId) {
      return new NextResponse("Missing configId", { status: 400 });
    }

    const result = await createCheckoutSession({ configId });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? "Unknown error");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
