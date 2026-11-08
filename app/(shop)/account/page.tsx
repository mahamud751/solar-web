import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBdt } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { ProfileForm } from "@/components/auth/AuthForms";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata = { title: "Account | Nirvana Power Tech" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const user = await requireUser();
  const error = one((await searchParams).error);
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <section className="shopSection">
      <div className="pageHead">
        <div>
          <h1>Hello, {user.name.split(" ")[0]}</h1>
          <p>{user.email}</p>
        </div>
        <form action={logout}>
          <button className="textButton">Log out</button>
        </form>
      </div>
      <Notice error={error} />
      <div className="cartLayout">
        <div>
          <h2>Orders</h2>
          {orders.length === 0 ? (
            <div className="emptyState">
              <p>No orders yet.</p>
              <Link className="btn dark" href="/products">
                Shop street lights
              </Link>
            </div>
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/account/orders/${order.id}`}>{order.orderNo}</Link>
                        <small>{order.createdAt.toLocaleDateString("en-GB")}</small>
                      </td>
                      <td>{order.status}</td>
                      <td>{formatBdt(order.total)}</td>
                      <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <h2>Profile</h2>
          <ProfileForm user={user} />
        </div>
      </div>
    </section>
  );
}
