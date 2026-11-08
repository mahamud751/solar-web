import HomePage from "@/components/HomePage";
import { priceLabel } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      power: true,
      image: true,
      price: true,
      callForPrice: true,
      stock: true,
    },
  });

  return (
    <HomePage
      products={rows.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        power: product.power,
        image: product.image,
        priceText: priceLabel(product.price, product.callForPrice),
        canBuy: product.stock > 0,
      }))}
    />
  );
}
