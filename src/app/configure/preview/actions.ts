"use server";

import { db } from "@/app/db";
import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { stripe } from "@/lib/stripe";
import { Order } from "@prisma/client";

export const checkUserInDb = async (userEmail: string) => {
  if (!userEmail) {
    throw new Error("User email not found");
  }

  const dbuser = await db.user.findFirst({
    where: { email: userEmail },
  });

  if (!dbuser) {
    await db.user.create({
      data: {
        email: userEmail,
      },
    });
  }
};

export const createCheckoutSession = async ({
  configId,
  userEmail,
}: {
  configId: string;
  userEmail: string;
}) => {
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });

  if (!configuration) {
    throw new Error("No such configuration found");
  }

  if (!userEmail) {
    throw new Error("User email not found");
  }

  let dbuser = await db.user.findFirst({
    where: { email: userEmail },
  });

  if (!dbuser) {
    dbuser = await db.user.create({
      data: {
        email: userEmail,
      },
    });
  }

  const { finish, material } = configuration;

  let price = BASE_PRICE;
  if (finish === "textured") price += PRODUCT_PRICES.finish.textured;
  if (material === "polycarbonate")
    price += PRODUCT_PRICES.material.polycarbonate;

  let order: Order | undefined = undefined;

  const existingOrder = await db.order.findFirst({
    where: {
      userId: dbuser.id,
      configurationId: configuration.id,
    },
  });

  //console.log(user.id, configuration.id);

  if (existingOrder) {
    order = existingOrder;
  } else {
    order = await db.order.create({
      data: {
        amount: price / 100,
        userId: dbuser.id,
        configurationId: configuration.id,
      },
    });
  }

  const product = await stripe.products.create({
    name: "Custom iPhone Case",
    images: [configuration.imageUrl],
    default_price_data: {
      currency: "USD",
      unit_amount: price,
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${
      order!.id
    }`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ["card", "paypal"],
    mode: "payment",
    shipping_address_collection: { allowed_countries: ["DE", "US"] },
    metadata: {
      userId: dbuser.id,
      orderId: order!.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  });

  return { url: stripeSession.url };
};
