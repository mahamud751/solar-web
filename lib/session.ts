import "server-only";
import { cookies } from "next/headers";
import { decryptSession, encryptSession } from "@/lib/jwt";

const cookieName = "session";

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await encryptSession({ userId });
  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(cookieName)?.value);
}
