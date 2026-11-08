import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DISTRICTS, formatBdt, priceLabel, quoteTotals } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { placeOrder } from "@/app/actions/orders";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata = { title: "Checkout | Nirvana Power Tech" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const user = await requireUser();
  const error = one((await searchParams).error);
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
  if (!items.length) redirect("/cart");
  const totals = quoteTotals(
    items.map((item) => ({
      price: item.product.price ?? 0,
      quantity: item.quantity,
      callForPrice: item.product.callForPrice || item.product.price == null,
    })),
  );

  return (
    <section className="shopSection">
      <h1>Checkout</h1>
      <Notice error={error} />
      <div className="cartLayout">
        <form action={placeOrder} className="authForm">
          <label>
            Recipient name
            <input name="name" required defaultValue={user.name} />
          </label>
          <label>
            Mobile
            <input name="phone" required defaultValue={user.phone} pattern="01[3-9][0-9]{8}" />
          </label>
          <label>
            Email
            <input name="email" type="email" required defaultValue={user.email} />
          </label>
          <label>
            District
            <select name="district" required defaultValue={user.district}>
              <option value="">Select district</option>
              {DISTRICTS.map((district) => (
                <option key={district}>{district}</option>
              ))}
            </select>
          </label>
          <label>
            Delivery address
            <textarea name="address" required rows={4} defaultValue={user.address} />
          </label>
          <label>
            Note
            <textarea name="note" rows={3} placeholder="Gate colour, preferred call time…" />
          </label>
          <button className="btn dark">Place order</button>
        </form>
        <aside className="summaryCard">
          <h2>Order</h2>
          {items.map((item) => (
            <p key={item.id}>
              <span>
                {item.quantity} × {item.product.name}
              </span>
              <b>{priceLabel(item.product.price, item.product.callForPrice)}</b>
            </p>
          ))}
          <p>
            <span>Delivery</span>
            <b>{totals.shipping === 0 ? "Free" : formatBdt(totals.shipping)}</b>
          </p>
          <p>
            <span>To pay for priced items</span>
            <b>{formatBdt(totals.total)}</b>
          </p>
          <Link href="/cart">Edit cart</Link>
        </aside>
      </div>
    </section>
  );
}
