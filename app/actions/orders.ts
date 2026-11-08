"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { quoteTotals } from "@/lib/constants";
import { text, validEmail, validPhone } from "@/lib/form";

function orderNo() {
  return `NPT-${Date.now().toString(36).toUpperCase()}`;
}

export async function placeOrder(formData: FormData) {
  const user = await requireUser();
  const name = text(formData, "name");
  const phone = text(formData, "phone");
  const email = text(formData, "email").toLowerCase();
  const district = text(formData, "district");
  const address = text(formData, "address");
  const note = text(formData, "note");

  if (name.length < 2) redirect("/checkout?error=" + encodeURIComponent("Enter the recipient name."));
  if (!validPhone(phone)) redirect("/checkout?error=" + encodeURIComponent("Enter a valid mobile number."));
  if (!validEmail(email)) redirect("/checkout?error=" + encodeURIComponent("Enter a valid email."));
  if (!district) redirect("/checkout?error=" + encodeURIComponent("Choose a district."));
  if (address.length < 5) redirect("/checkout?error=" + encodeURIComponent("Enter a delivery address."));

  const cart = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
  if (!cart.length) redirect("/cart?error=" + encodeURIComponent("Your cart is empty."));

  let orderId = "";
  try {
    const order = await prisma.$transaction(async (tx) => {
      const lines: { productId: string; name: string; price: number; quantity: number; callForPrice: boolean }[] = [];
      for (const item of cart) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.active) throw new Error(`${item.product.name} is no longer available.`);
        if (product.stock < item.quantity) throw new Error(`${product.name} only has ${product.stock} in stock.`);
        await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: item.quantity } } });
        const callForPrice = product.callForPrice || product.price == null;
        lines.push({
          productId: product.id,
          name: product.name,
          price: callForPrice ? 0 : product.price ?? 0,
          quantity: item.quantity,
          callForPrice,
        });
      }
      const totals = quoteTotals(lines);
      const created = await tx.order.create({
        data: {
          orderNo: orderNo(),
          userId: user.id,
          ...totals,
          name,
          phone,
          email,
          district,
          address,
          note,
          items: { create: lines },
        },
      });
      await tx.cartItem.deleteMany({ where: { userId: user.id } });
      return created;
    });
    orderId = order.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the order.";
    redirect("/checkout?error=" + encodeURIComponent(message));
  }
  redirect(`/account/orders/${orderId}`);
}

export async function cancelOrder(formData: FormData) {
  const user = await requireUser();
  const id = text(formData, "id");
  const order = await prisma.order.findFirst({ where: { id, userId: user.id }, include: { items: true } });
  if (!order) redirect("/account");
  if (order.status !== "PENDING") {
    redirect(`/account/orders/${id}?error=` + encodeURIComponent("Only pending orders can be cancelled."));
  }
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (!item.productId) continue;
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
    await tx.order.update({ where: { id }, data: { status: "CANCELLED" } });
  });
  redirect(`/account/orders/${id}`);
}
