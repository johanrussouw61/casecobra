"use server";

import { db } from "../db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  console.log("inside thankyou actions user: ", user);

  if (!user?.id || !user.email) {
    throw new Error("You need to be logged in to view thank-you page.");
  }
  // Fetch order first to get the user

  const order = await db.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      billingAddress: true,
      configuration: true,
      shippingAddress: true,
      user: true,
    },
  });

  if (!order) throw new Error("This order does not exist.");

  if (order.isPaid) {
    return order;
  } else {
    return false;
  }
};
