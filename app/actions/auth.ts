"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { safeNext, text, validEmail, validPhone } from "@/lib/form";

export type ActionState = { error?: string; ok?: string } | undefined;

export async function register(_state: ActionState, formData: FormData): Promise<ActionState> {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const password = text(formData, "password");
  const district = text(formData, "district");
  const address = text(formData, "address");
  const next = safeNext(text(formData, "next") || "/account");

  if (name.length < 2) return { error: "Enter your full name." };
  if (!validEmail(email)) return { error: "Enter a valid email address." };
  if (!validPhone(phone)) return { error: "Enter an 11-digit Bangladesh mobile number." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists. Log in instead." };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hash(password, 12),
      district,
      address,
    },
  });
  await createSession(user.id);
  redirect(next);
}

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const requested = text(formData, "next");
  if (!validEmail(email) || !password) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await compare(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await createSession(user.id);
  if (requested) redirect(safeNext(requested));
  redirect(user.role === "ADMIN" ? "/admin" : "/account");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

export async function updateProfile(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const name = text(formData, "name");
  const phone = text(formData, "phone");
  const district = text(formData, "district");
  const address = text(formData, "address");
  const currentPassword = text(formData, "currentPassword");
  const newPassword = text(formData, "newPassword");

  if (name.length < 2) return { error: "Enter your full name." };
  if (!validPhone(phone)) return { error: "Enter an 11-digit Bangladesh mobile number." };
  if (newPassword && newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword && !currentPassword) return { error: "Enter your current password to set a new one." };

  if (newPassword) {
    const stored = await prisma.user.findUnique({ where: { id: user.id } });
    if (!stored || !(await compare(currentPassword, stored.passwordHash))) {
      return { error: "Current password is incorrect." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone,
      district,
      address,
      ...(newPassword ? { passwordHash: await hash(newPassword, 12) } : {}),
    },
  });
  return { ok: "Profile saved." };
}
