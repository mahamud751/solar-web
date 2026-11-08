import Link from "next/link";
import { ArrowUpRight, Boxes, Clock3, PackagePlus, ShoppingBag, Users, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatBdt } from "@/lib/constants";

export default async function AdminHome() {
  const [products, users, orders, pending, revenue, lowStock, recent] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.product.findMany({ where: { stock: { lte: 5 }, active: true }, orderBy: { stock: "asc" }, take: 5 }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: true } }),
  ]);
  const cards = [
    { label: "Revenue", value: formatBdt(revenue._sum.total ?? 0), hint: "Excludes cancelled", icon: Wallet, tone: "lime" },
    { label: "Orders", value: String(orders), hint: `${pending} waiting`, icon: ShoppingBag, tone: "blue" },
    { label: "Products", value: String(products), hint: "In the catalog", icon: Boxes, tone: "ink" },
    { label: "Customers", value: String(users), hint: "Accounts", icon: Users, tone: "green" },
  ];

  return (
    <section className="dash">
      <div className="pageHead">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p>Orders, stock, and catalog in one place.</p>
        </div>
        <div className="headActions">
          <Link className="iconBtn" href="/admin/products/new">
            <PackagePlus size={16} /> Add product
          </Link>
          <Link className="iconBtn solid" href="/admin/orders">
            <ShoppingBag size={16} /> Orders
          </Link>
        </div>
      </div>
      <div className="statGrid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`statCard ${card.tone}`}>
              <span className="statIcon">
                <Icon size={18} />
              </span>
              <b>{card.value}</b>
              <strong>{card.label}</strong>
              <small>{card.hint}</small>
            </article>
          );
        })}
      </div>
      <div className="dashGrid">
        <div className="panel">
          <div className="panelHead">
            <h2>Recent orders</h2>
            <Link href="/admin/orders">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id}`}>{order.orderNo}</Link>
                      <small>{order.createdAt.toLocaleDateString("en-GB")}</small>
                    </td>
                    <td>{order.user.name}</td>
                    <td>
                      <span className={`statusPill s-${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td>{formatBdt(order.total)}</td>
                  </tr>
                ))}
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No orders yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="panelHead">
            <h2>Low stock</h2>
            <Clock3 size={16} />
          </div>
          <ul className="plainList">
            {lowStock.map((product) => (
              <li key={product.id}>
                <Link href={`/admin/products/${product.id}/edit`}>{product.name}</Link>
                <span className={product.stock === 0 ? "stockOut" : "stockLow"}>{product.stock} left</span>
              </li>
            ))}
            {lowStock.length === 0 ? <li>Every active product has more than 5 in stock.</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
