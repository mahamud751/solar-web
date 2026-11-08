import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  const cart = user
    ? await prisma.cartItem.aggregate({ where: { userId: user.id }, _sum: { quantity: true } })
    : null;
  return Response.json({
    user: user ? { name: user.name, role: user.role } : null,
    cartCount: cart?._sum.quantity ?? 0,
  });
}
