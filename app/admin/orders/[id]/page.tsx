import Link from "next/link";
import { ArrowLeft, Check, Plus, Save, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DISTRICTS, ORDER_STATUSES, formatBdt } from "@/lib/constants";
import { addOrderItem, deleteOrder, removeOrderItem, updateOrder, updateOrderItem } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { id } = await params;
  const error = one((await searchParams).error);
  const [order, products] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true, user: true } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!order) notFound();
  const lineCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="orderPage">
      <div className="pageHead">
        <div>
          <Link href="/admin/orders" className="backLink">
            <ArrowLeft size={14} /> Orders
          </Link>
          <p className="eyebrow">Order</p>
          <div className="orderTitle">
            <h1>{order.orderNo}</h1>
            <span className={`statusPill s-${order.status.toLowerCase()}`}>{order.status}</span>
          </div>
          <p>
            {order.name} · {order.phone}
            <br />
            Placed {order.createdAt.toLocaleString("en-GB")} · Account {order.user.email}
          </p>
        </div>
        <form action={deleteOrder}>
          <input type="hidden" name="id" value={order.id} />
          <ConfirmButton className="iconBtn danger" message="Delete this order and restore stock?">
            <Trash2 size={15} /> Delete order
          </ConfirmButton>
        </form>
      </div>
      <Notice error={error} />

      <div className="panel">
        <div className="panelHead">
          <h2>Items</h2>
          <span>
            {order.items.length} {order.items.length === 1 ? "line" : "lines"} · {lineCount} qty
          </span>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Line</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.name}
                    {item.callForPrice ? <small>Call for price</small> : null}
                  </td>
                  <td>{item.callForPrice ? "Quote" : formatBdt(item.price)}</td>
                  <td>
                    <form action={updateOrderItem} className="inlineForm">
                      <input type="hidden" name="id" value={item.id} />
                      <input name="quantity" type="number" min={1} defaultValue={item.quantity} />
                      <button className="iconBtn">
                        <Check size={14} /> Update
                      </button>
                    </form>
                  </td>
                  <td>{item.callForPrice ? "Quote" : formatBdt(item.price * item.quantity)}</td>
                  <td>
                    <form action={removeOrderItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmButton className="iconBtn danger" message="Remove this line and restore its stock?">
                        <Trash2 size={15} /> Remove
                      </ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
              {order.items.length === 0 ? (
                <tr>
                  <td colSpan={5}>No items on this order yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <form action={addOrderItem} className="inlineCreate">
          <input type="hidden" name="orderId" value={order.id} />
          <select name="productId" required defaultValue="">
            <option value="" disabled>
              Add a product
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.stock} in stock)
              </option>
            ))}
          </select>
          <input className="qty" name="quantity" type="number" min={1} defaultValue={1} aria-label="Quantity" />
          <button className="iconBtn solid">
            <Plus size={16} /> Add item
          </button>
        </form>
      </div>

      <form action={updateOrder} className="orderGrid">
        <input type="hidden" name="id" value={order.id} />
        <div className="adminForm">
          <label>
            Recipient
            <input name="name" required defaultValue={order.name} />
          </label>
          <label>
            Mobile
            <input name="phone" required defaultValue={order.phone} />
          </label>
          <label>
            Email
            <input name="email" type="email" required defaultValue={order.email} />
          </label>
          <label>
            District
            <select name="district" defaultValue={order.district}>
              {DISTRICTS.map((district) => (
                <option key={district}>{district}</option>
              ))}
            </select>
          </label>
          <label className="wide">
            Address
            <textarea name="address" rows={3} required defaultValue={order.address} />
          </label>
          <label className="wide">
            Note
            <textarea name="note" rows={3} defaultValue={order.note} />
          </label>
        </div>
        <aside className="summaryCard orderSummary">
          <p className="eyebrow">Total</p>
          <b>{formatBdt(order.total)}</b>
          <p>
            <span>Subtotal</span>
            <strong>{formatBdt(order.subtotal)}</strong>
          </p>
          <p>
            <span>Delivery</span>
            <strong>{formatBdt(order.shipping)}</strong>
          </p>
          <label>
            Status
            <select name="status" defaultValue={order.status}>
              {ORDER_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <button className="iconBtn solid">
            <Save size={16} /> Save order
          </button>
        </aside>
      </form>
    </section>
  );
}
