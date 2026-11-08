import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { priceLabel } from "@/lib/constants";
import { addToCart } from "@/app/actions/cart";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product ? `${product.name} | Nirvana Power Tech` : "Product" };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { slug } = await params;
  const error = one((await searchParams).error);
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
  if (!product || !product.active) notFound();
  const features = product.features.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <section className="shopSection productDetail">
      <Link href="/products" className="backLink">
        ← All products
      </Link>
      <Notice error={error} />
      <div>
        <div className="productPhoto large">
          <img src={product.image || "/solar-hero.png"} alt={product.name} />
        </div>
        <div>
          <span>
            {product.category.name} · {product.brand}
          </span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <strong>{priceLabel(product.price, product.callForPrice)}</strong>
          <small>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"} · Warranty: {product.warranty}</small>
          {product.stock > 0 ? (
            <form action={addToCart} className="qtyRow">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="next" value={`/products/${product.slug}`} />
              <label>
                Qty
                <input name="quantity" type="number" min={1} max={product.stock} defaultValue={1} />
              </label>
              <button className="btn dark">{product.callForPrice || product.price == null ? "Add to quote" : "Add to cart"}</button>
            </form>
          ) : null}
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <a href="tel:+8801711064667">Call 01711-064667</a>
        </div>
      </div>
    </section>
  );
}
