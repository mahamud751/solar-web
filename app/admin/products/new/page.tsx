import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProduct } from "@/app/actions/admin";
import { ProductForm } from "@/components/admin/Forms";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const error = one((await searchParams).error);
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <section className="narrow">
      <Link href="/admin/products" className="backLink">
        ← Products
      </Link>
      <h1>New product</h1>
      <Notice error={error} />
      <ProductForm action={createProduct} categories={categories} />
    </section>
  );
}
