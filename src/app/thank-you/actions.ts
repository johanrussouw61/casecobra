"use server";

import { db } from "../db";

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  // Fetch order first to get the user
  const order = await db.order.findFirst({
    where: { id: orderId },
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
