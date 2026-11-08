import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const error = one((await searchParams).error);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return (
    <section>
      <div className="pageHead">
        <h1>Users</h1>
        <Link className="iconBtn solid" href="/admin/users/new">
          <Plus size={16} /> Add user
        </Link>
      </div>
      <Notice error={error} />
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Orders</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.name}
                  <small>{user.district || "No district"}</small>
                </td>
                <td>
                  {user.email}
                  <small>{user.phone}</small>
                </td>
                <td>
                  <span className={`statusPill ${user.role === "ADMIN" ? "s-processing" : "s-confirmed"}`}>{user.role}</span>
                </td>
                <td>{user._count.orders}</td>
                <td className="rowActions">
                  <Link className="iconBtn" href={`/admin/users/${user.id}/edit`}>
                    <Pencil size={15} /> Edit
                  </Link>
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={user.id} />
                    <ConfirmButton className="iconBtn danger" message={`Delete ${user.name}?`}>
                      <Trash2 size={15} /> Delete
                    </ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
