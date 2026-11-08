import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBdt, priceLabel } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { cancelOrder } from "@/app/actions/orders";
import { Notice } from "@/components/shop/Notice";
import { ConfirmButton } from "@/components/ConfirmButton";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata = { title: "Order | Nirvana Power Tech" };

export default async function CustomerOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const error = one((await searchParams).error);
  const order = await prisma.order.findFirst({ where: { id, userId: user.id }, include: { items: true } });
  if (!order) notFound();

  return (
    <section className="shopSection narrow">
      <Link href="/account" className="backLink">
        ← Your orders
      </Link>
      <div className="pageHead">
        <div>
          <h1>{order.orderNo}</h1>
          <p>
            {order.status} · {order.createdAt.toLocaleString("en-GB")}
          </p>
        </div>
      </div>
      <Notice error={error} />
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.callForPrice ? "Call for price" : priceLabel(item.price, false)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside className="summaryCard">
        <p>
          <span>Priced items</span>
          <b>{formatBdt(order.subtotal)}</b>
        </p>
        <p>
          <span>Delivery</span>
          <b>{order.shipping === 0 ? "Free" : formatBdt(order.shipping)}</b>
        </p>
        <p>
          <span>Total</span>
          <b>{formatBdt(order.total)}</b>
        </p>
        <p>
          {order.name}
          <br />
          {order.phone}
          <br />
          {order.address}, {order.district}
        </p>
        {order.note ? <small>Note: {order.note}</small> : null}
      </aside>
      {order.status === "PENDING" ? (
        <form action={cancelOrder}>
          <input type="hidden" name="id" value={order.id} />
          <ConfirmButton className="textButton" message="Cancel this order?">
            Cancel order
          </ConfirmButton>
        </form>
      ) : null}
    </section>
  );
}
