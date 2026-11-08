import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBdt, priceLabel, quoteTotals } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { removeCartItem, updateCartItem } from "@/app/actions/cart";
import { Notice } from "@/components/shop/Notice";
import { ConfirmButton } from "@/components/ConfirmButton";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata = { title: "Cart | Nirvana Power Tech" };

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");
  const error = one((await searchParams).error);
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
  const totals = quoteTotals(
    items.map((item) => ({
      price: item.product.price ?? 0,
      quantity: item.quantity,
      callForPrice: item.product.callForPrice || item.product.price == null,
    })),
  );

  return (
    <section className="shopSection">
      <h1>Your cart</h1>
      <Notice error={error} />
      {items.length === 0 ? (
        <div className="emptyState">
          <p>Your cart is empty.</p>
          <Link className="btn dark" href="/products">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="cartLayout">
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                      <small>{item.product.power}</small>
                    </td>
                    <td>{priceLabel(item.product.price, item.product.callForPrice)}</td>
                    <td>
                      <form action={updateCartItem} className="inlineForm">
                        <input type="hidden" name="id" value={item.id} />
                        <input name="quantity" type="number" min={1} max={item.product.stock} defaultValue={item.quantity} />
                        <button>Update</button>
                      </form>
                    </td>
                    <td>
                      <form action={removeCartItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmButton className="textButton" message="Remove this item?">
                          Remove
                        </ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="summaryCard">
            <h2>Summary</h2>
            <p>
              <span>Priced items</span>
              <b>{formatBdt(totals.subtotal)}</b>
            </p>
            <p>
              <span>Delivery</span>
              <b>{totals.shipping === 0 ? "Free" : formatBdt(totals.shipping)}</b>
            </p>
            <p>
              <span>Total now</span>
              <b>{formatBdt(totals.total)}</b>
            </p>
            <small>Call-for-price lines stay on the order for quotation and are not added to this total. Delivery is ৳300, free from ৳15,000.</small>
            <Link className="btn dark" href="/checkout">
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
