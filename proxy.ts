import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;
  const userId = await decryptSession(token);
  if (userId) return NextResponse.next();
  const url = new URL("/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/account", "/account/:path*", "/checkout", "/checkout/:path*", "/admin", "/admin/:path*"],
};
