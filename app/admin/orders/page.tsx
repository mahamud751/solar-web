import Link from "next/link";
import { Trash2 } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatBdt } from "@/lib/constants";
import { deleteOrder } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; status?: string | string[] }>;
}) {
  const params = await searchParams;
  const error = one(params.error);
  const requested = one(params.status) ?? "";
  const status = (Object.values(OrderStatus) as string[]).includes(requested) ? (requested as OrderStatus) : undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });
  const filters = ["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <section>
      <h1>Orders</h1>
      <Notice error={error} />
      <div className="chipRow filterPills">
        {filters.map((item) => (
          <Link key={item || "all"} className={(status ?? "") === item ? "active" : ""} href={item ? `/admin/orders?status=${item}` : "/admin/orders"}>
            {item || "All"}
          </Link>
        ))}
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>District</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders/${order.id}`}>{order.orderNo}</Link>
                  <small>{order.createdAt.toLocaleString("en-GB")}</small>
                </td>
                <td>
                  {order.name}
                  <small>{order.phone}</small>
                </td>
                <td>
                  <span className={`statusPill s-${order.status.toLowerCase()}`}>{order.status}</span>
                </td>
                <td>{formatBdt(order.total)}</td>
                <td>{order.district}</td>
                <td>
                  <form action={deleteOrder}>
                    <input type="hidden" name="id" value={order.id} />
                    <ConfirmButton className="iconBtn danger" message={`Delete ${order.orderNo}? Stock will be restored.`}>
                      <Trash2 size={15} /> Delete
                    </ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6}>No orders in this view.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
