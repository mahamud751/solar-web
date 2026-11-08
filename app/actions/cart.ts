"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { safeNext, text } from "@/lib/form";

export async function addToCart(formData: FormData) {
  const user = await getCurrentUser();
  const next = safeNext(text(formData, "next") || "/cart");
  const productId = text(formData, "productId");
  const quantity = Math.max(1, Number(text(formData, "quantity")) || 1);
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) redirect(`${next}?error=${encodeURIComponent("This product is not available.")}`);
  if (product.stock < 1) redirect(`${next}?error=${encodeURIComponent("This product is out of stock.")}`);

  const existing = await prisma.cartItem.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
  const nextQty = (existing?.quantity ?? 0) + quantity;
  if (nextQty > product.stock) {
    redirect(`${next}?error=${encodeURIComponent(`Only ${product.stock} in stock.`)}`);
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { quantity: nextQty },
    create: { userId: user.id, productId, quantity },
  });
  redirect("/cart");
}

export async function updateCartItem(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");
  const id = text(formData, "id");
  const quantity = Number(text(formData, "quantity"));
  const item = await prisma.cartItem.findFirst({ where: { id, userId: user.id }, include: { product: true } });
  if (!item) redirect("/cart");
  if (!Number.isInteger(quantity) || quantity < 1) {
    redirect("/cart?error=" + encodeURIComponent("Quantity must be at least 1."));
  }
  if (quantity > item.product.stock) {
    redirect("/cart?error=" + encodeURIComponent(`Only ${item.product.stock} of ${item.product.name} in stock.`));
  }
  await prisma.cartItem.update({ where: { id }, data: { quantity } });
  redirect("/cart");
}

export async function removeCartItem(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");
  const id = text(formData, "id");
  await prisma.cartItem.deleteMany({ where: { id, userId: user.id } });
  redirect("/cart");
}
