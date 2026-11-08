import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { priceLabel } from "@/lib/constants";
import { deleteProduct } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const error = one((await searchParams).error);
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } });
  return (
    <section>
      <div className="pageHead">
        <h1>Products</h1>
        <Link className="iconBtn solid" href="/admin/products/new">
          <Plus size={16} /> Add product
        </Link>
      </div>
      <Notice error={error} />
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Visible</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.name}
                  <small>{product.brand} · {product.power}</small>
                </td>
                <td>{product.category.name}</td>
                <td>{priceLabel(product.price, product.callForPrice)}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={product.active ? "statusPill s-confirmed" : "statusPill s-cancelled"}>{product.active ? "Live" : "Hidden"}</span>
                </td>
                <td className="rowActions">
                  <Link className="iconBtn" href={`/admin/products/${product.id}/edit`}>
                    <Pencil size={15} /> Edit
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <ConfirmButton className="iconBtn danger" message={`Delete ${product.name}?`}>
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
