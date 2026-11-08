import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/app/actions/admin";
import { ProductForm } from "@/components/admin/Forms";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { id } = await params;
  const error = one((await searchParams).error);
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <section className="narrow">
      <Link href="/admin/products" className="backLink">
        ← Products
      </Link>
      <h1>Edit product</h1>
      <Notice error={error} />
      <ProductForm action={updateProduct} categories={categories} product={product} />
    </section>
  );
}
