import OrderReceivedEmail from "@/app/components/OrderReceivedEmail";
import { db } from "@/app/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import stripe, { Stripe } from "stripe";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");
    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing email from Stripe");
      }
    }
    const session = event.data.object as Stripe.Checkout.Session;

    const { userId, orderId } = session.metadata || {
      userId: null,
      orderId: null,
    };

    if (!userId || !orderId) {
      throw new Error("Invalid request metadata");
    }

    const billingAddress = session.customer_details!.address;
    const shippingAddress = session.customer_details!.address;

    const updatedOrder = await db.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
        shippingAddress: {
          create: {
            name: session.customer_details!.name!,
            city: shippingAddress!.city!,
            country: shippingAddress!.country!,
            postalCode: shippingAddress!.postal_code!,
            street: shippingAddress!.line1!,
            state: shippingAddress!.state!,
          },
        },
        billingAddress: {
          create: {
            name: session.customer_details!.name!,
            city: billingAddress!.city!,
            country: billingAddress!.country!,
            postalCode: billingAddress!.postal_code!,
            street: billingAddress!.line1!,
            state: billingAddress!.state!,
          },
        },
      },
    });
    //console.log("customer email: ", session.customer_details!.email!);

    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY environment variable");
      return NextResponse.json(
        { message: "Missing RESEND_API_KEY", ok: false },
        { status: 500 }
      );
    }

    try {
      const emailResult = await resend.emails.send({
        from: "johanrussouw490@gmail.com",
        to: [session.customer_details!.email!],
        subject: "Thanks for your order!",
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          shippingAddress: {
            name: session.customer_details!.name!,
            city: shippingAddress!.city!,
            country: shippingAddress!.country!,
            postalCode: shippingAddress!.postal_code!,
            street: shippingAddress!.line1!,
            state: shippingAddress!.state,
            id: "",
            phoneNumber: null,
          },
        }),
      });
      console.log("EmailResult: ", emailResult);
    } catch (sendErr) {
      console.error("Resend error sending email:", sendErr);
      const status =
        (
          sendErr as unknown as {
            response?: { status?: number };
            status?: number;
          }
        )?.response?.status ||
        (
          sendErr as unknown as {
            response?: { status?: number };
            status?: number;
          }
        )?.status;
      if (status === 403) {
        console.error(
          "Resend returned 403. Check RESEND_API_KEY and account/sender permissions."
        );
      }
      return NextResponse.json(
        { message: "Failed to send email via Resend", ok: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Something went wrong from Stripe", ok: false },
      { status: 500 }
    );
  }
}
