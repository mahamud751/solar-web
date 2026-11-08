import { Plus, Save, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory, updateCategory } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const error = one((await searchParams).error);
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <section>
      <h1>Categories</h1>
      <Notice error={error} />
      <form action={createCategory} className="inlineCreate">
        <input name="name" required placeholder="New category name" />
        <button className="iconBtn solid">
          <Plus size={16} /> Add category
        </button>
      </form>
      <div className="stack">
        {categories.map((category) => (
          <div key={category.id} className="inlineCreate">
            <form action={updateCategory}>
              <input type="hidden" name="id" value={category.id} />
              <input name="name" required defaultValue={category.name} />
              <button className="iconBtn">
                <Save size={15} /> Save
              </button>
            </form>
            <span>{category._count.products} products</span>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <ConfirmButton className="iconBtn danger" message={`Delete ${category.name}?`}>
                <Trash2 size={15} /> Delete
              </ConfirmButton>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}
