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
    return new NextResponse(`Error creating session ${error}  `, {
      status: 400,
    });
  }
}
