"use server";

import { hash } from "bcryptjs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import type { OrderStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES, quoteTotals, slugify } from "@/lib/constants";
import { checked, text, validEmail, validPhone } from "@/lib/form";

function fail(pathName: string, message: string): never {
  redirect(`${pathName}?error=${encodeURIComponent(message)}`);
}

function rethrowRedirect(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).includes("NEXT_REDIRECT")
  ) {
    throw error;
  }
}

async function saveImage(file: FormDataEntryValue | null, fallback: string) {
  if (!(file instanceof File) || file.size === 0) return fallback;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Upload a JPG, PNG, or WebP image.");
  }
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const root = slugify(base) || "product";
  let slug = root;
  let n = 2;
  while (await prisma.product.findFirst({ where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

function productInput(formData: FormData) {
  const name = text(formData, "name");
  const brand = text(formData, "brand");
  const power = text(formData, "power");
  const description = text(formData, "description");
  const features = text(formData, "features");
  const warranty = text(formData, "warranty");
  const categoryId = text(formData, "categoryId");
  const callForPrice = checked(formData, "callForPrice");
  const priceRaw = text(formData, "price");
  const stock = Number(text(formData, "stock"));
  const slugInput = text(formData, "slug");
  let price: number | null = null;
  if (!callForPrice) {
    if (!/^\d+$/.test(priceRaw) || Number(priceRaw) < 1) throw new Error("Enter a price in BDT, or mark the product as call for price.");
    price = Number(priceRaw);
  }
  if (!name || !brand || !power || !description || !categoryId) throw new Error("Name, brand, power, description, and category are required.");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be zero or more.");
  return {
    name,
    brand,
    power,
    description,
    features,
    warranty: warranty || "Ask",
    categoryId,
    callForPrice,
    price,
    stock,
    slugInput: slugInput || name,
    active: checked(formData, "active"),
    featured: checked(formData, "featured"),
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  try {
    const input = productInput(formData);
    const image = await saveImage(formData.get("imageFile"), text(formData, "image") || "/solar-hero.png");
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) fail("/admin/products/new", "Choose a category.");
    const { slugInput, ...data } = input;
    await prisma.product.create({
      data: { ...data, image, slug: await uniqueSlug(slugInput) },
    });
  } catch (error) {
    rethrowRedirect(error);
    fail("/admin/products/new", error instanceof Error ? error.message : "Could not create the product.");
  }
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  try {
    const input = productInput(formData);
    const current = text(formData, "currentImage");
    const image = await saveImage(formData.get("imageFile"), text(formData, "image") || current || "/solar-hero.png");
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) fail(`/admin/products/${id}/edit`, "Choose a category.");
    const { slugInput, ...data } = input;
    await prisma.product.update({
      where: { id },
      data: { ...data, image, slug: await uniqueSlug(slugInput, id) },
    });
  } catch (error) {
    rethrowRedirect(error);
    fail(`/admin/products/${id}/edit`, error instanceof Error ? error.message : "Could not update the product.");
  }
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  await prisma.product.delete({ where: { id } });
  redirect("/admin/products");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  if (name.length < 2) fail("/admin/categories", "Enter a category name.");
  const slug = slugify(name);
  const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (exists) fail("/admin/categories", "That category already exists.");
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  await prisma.category.create({ data: { name, slug, sortOrder: (last._max.sortOrder ?? 0) + 1 } });
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (name.length < 2) fail("/admin/categories", "Enter a category name.");
  const slug = slugify(name);
  const exists = await prisma.category.findFirst({ where: { id: { not: id }, OR: [{ name }, { slug }] } });
  if (exists) fail("/admin/categories", "That category already exists.");
  await prisma.category.update({ where: { id }, data: { name, slug } });
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count) fail("/admin/categories", "Move or delete the products in this category first.");
  await prisma.category.delete({ where: { id } });
  redirect("/admin/categories");
}

async function refreshOrder(id: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId: id } });
  const totals = quoteTotals(items);
  await prisma.order.update({ where: { id }, data: totals });
}

export async function updateOrder(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) fail(`/admin/orders/${id}`, "Choose a valid status.");
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) fail("/admin/orders", "Order not found.");
  const name = text(formData, "name");
  const phone = text(formData, "phone");
  const email = text(formData, "email").toLowerCase();
  const district = text(formData, "district");
  const address = text(formData, "address");
  const note = text(formData, "note");
  if (name.length < 2 || !validPhone(phone) || !validEmail(email) || address.length < 5 || !district) {
    fail(`/admin/orders/${id}`, "Check the customer name, phone, email, district, and address.");
  }

  await prisma.$transaction(async (tx) => {
    const becomingCancelled = status === "CANCELLED" && order.status !== "CANCELLED";
    const leavingCancelled = order.status === "CANCELLED" && status !== "CANCELLED";
    if (becomingCancelled || leavingCancelled) {
      for (const item of order.items) {
        if (!item.productId) continue;
        if (leavingCancelled) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) throw new Error(`${item.name} does not have enough stock to reopen.`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: becomingCancelled ? item.quantity : -item.quantity } },
        });
      }
    }
    await tx.order.update({ where: { id }, data: { status, name, phone, email, district, address, note } });
  }).catch((error: unknown) => {
    fail(`/admin/orders/${id}`, error instanceof Error ? error.message : "Could not update the order.");
  });
  redirect(`/admin/orders/${id}`);
}

export async function updateOrderItem(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const quantity = Number(text(formData, "quantity"));
  const item = await prisma.orderItem.findUnique({ where: { id }, include: { order: true } });
  if (!item) fail("/admin/orders", "Item not found.");
  if (!Number.isInteger(quantity) || quantity < 1) fail(`/admin/orders/${item.orderId}`, "Quantity must be at least 1.");
  const delta = item.quantity - quantity;
  try {
    await prisma.$transaction(async (tx) => {
      if (item.productId && item.order.status !== "CANCELLED" && delta !== 0) {
        if (delta < 0) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < -delta) throw new Error("Not enough stock for that quantity.");
        }
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: delta } } });
      }
      await tx.orderItem.update({ where: { id }, data: { quantity } });
    });
    await refreshOrder(item.orderId);
  } catch (error) {
    rethrowRedirect(error);
    fail(`/admin/orders/${item.orderId}`, error instanceof Error ? error.message : "Could not update the item.");
  }
  redirect(`/admin/orders/${item.orderId}`);
}

export async function removeOrderItem(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const item = await prisma.orderItem.findUnique({ where: { id }, include: { order: true } });
  if (!item) fail("/admin/orders", "Item not found.");
  await prisma.$transaction(async (tx) => {
    if (item.productId && item.order.status !== "CANCELLED") {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
    await tx.orderItem.delete({ where: { id } });
  });
  await refreshOrder(item.orderId);
  redirect(`/admin/orders/${item.orderId}`);
}

export async function addOrderItem(formData: FormData) {
  await requireAdmin();
  const orderId = text(formData, "orderId");
  const productId = text(formData, "productId");
  const quantity = Number(text(formData, "quantity")) || 1;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!order || !product) fail(`/admin/orders/${orderId}`, "Choose a product.");
  if (!Number.isInteger(quantity) || quantity < 1) fail(`/admin/orders/${orderId}`, "Quantity must be at least 1.");
  try {
    await prisma.$transaction(async (tx) => {
      if (order.status !== "CANCELLED") {
        const fresh = await tx.product.findUnique({ where: { id: productId } });
        if (!fresh || fresh.stock < quantity) throw new Error("Not enough stock.");
        await tx.product.update({ where: { id: productId }, data: { stock: { decrement: quantity } } });
      }
      const callForPrice = product.callForPrice || product.price == null;
      await tx.orderItem.create({
        data: {
          orderId,
          productId,
          name: product.name,
          price: callForPrice ? 0 : product.price ?? 0,
          quantity,
          callForPrice,
        },
      });
    });
    await refreshOrder(orderId);
  } catch (error) {
    rethrowRedirect(error);
    fail(`/admin/orders/${orderId}`, error instanceof Error ? error.message : "Could not add the item.");
  }
  redirect(`/admin/orders/${orderId}`);
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) redirect("/admin/orders");
  await prisma.$transaction(async (tx) => {
    if (order.status !== "CANCELLED") {
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }
    await tx.order.delete({ where: { id } });
  });
  redirect("/admin/orders");
}

function userRole(value: string): Role {
  return value === "ADMIN" ? "ADMIN" : "CUSTOMER";
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const password = text(formData, "password");
  const role = userRole(text(formData, "role"));
  const district = text(formData, "district");
  const address = text(formData, "address");
  if (name.length < 2 || !validEmail(email) || !validPhone(phone) || password.length < 8) {
    fail("/admin/users/new", "Name, valid email, mobile number, and an 8-character password are required.");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) fail("/admin/users/new", "That email is already registered.");
  await prisma.user.create({
    data: { name, email, phone, role, district, address, passwordHash: await hash(password, 12) },
  });
  redirect("/admin/users");
}

export async function updateUser(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const password = text(formData, "password");
  const role = userRole(text(formData, "role"));
  const district = text(formData, "district");
  const address = text(formData, "address");
  if (name.length < 2 || !validEmail(email) || !validPhone(phone)) {
    fail(`/admin/users/${id}/edit`, "Name, email, and mobile number are required.");
  }
  if (password && password.length < 8) fail(`/admin/users/${id}/edit`, "Password must be at least 8 characters.");
  if (id === admin.id && role !== "ADMIN") fail(`/admin/users/${id}/edit`, "You cannot remove your own admin access.");
  const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
  if (existing) fail(`/admin/users/${id}/edit`, "That email is already registered.");
  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      role,
      district,
      address,
      ...(password ? { passwordHash: await hash(password, 12) } : {}),
    },
  });
  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  if (id === admin.id) fail("/admin/users", "You cannot delete your own account.");
  const orders = await prisma.order.count({ where: { userId: id } });
  if (orders) fail("/admin/users", "This customer has orders. Cancel or delete those orders first.");
  await prisma.user.delete({ where: { id } });
  redirect("/admin/users");
}
