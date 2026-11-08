import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { priceLabel } from "@/lib/constants";
import { addToCart } from "@/app/actions/cart";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata = {
  title: "Shop solar street lights | Nirvana Power Tech",
  description: "Filatec, MODI, and Nirvana solar street lights with delivery across Bangladesh.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const category = one(params.category) ?? "";
  const q = one(params.q)?.trim() ?? "";
  const error = one(params.error);
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { power: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
  ]);

  return (
    <>
      <section className="pageHero shopHero">
        <span>SHOP</span>
        <h1>
          Solar street lights.
          <br />
          <em>Ready to order.</em>
        </h1>
        <p>Filatec, MODI, and Nirvana lights, plus complete pole packages. Delivery across Bangladesh. Prices still being confirmed show as call for price and can be added to a quotation order.</p>
      </section>
      <section className="shopSection">
        <Notice error={error} />
        <form className="shopFilters" action="/products">
          <input name="q" defaultValue={q} placeholder="Search 100W, Filatec, MODI…" />
          <button className="btn dark">Search</button>
        </form>
        <div className="chipRow">
          <Link className={!category ? "active" : ""} href={q ? `/products?q=${encodeURIComponent(q)}` : "/products"}>
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              className={category === item.slug ? "active" : ""}
              href={`/products?category=${item.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        {products.length === 0 ? (
          <p className="emptyState">No products match that search.</p>
        ) : (
          <div className="productGrid">
            {products.map((product) => (
              <article key={product.id} className="productCard">
                <Link href={`/products/${product.slug}`} className="productPhoto">
                  <img src={product.image || "/solar-hero.png"} alt={product.name} />
                  {product.featured ? <span>Featured</span> : null}
                </Link>
                <small>
                  {product.brand} · {product.power}
                </small>
                <h2>
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h2>
                <p>{product.category.name}</p>
                <footer>
                  <b>{priceLabel(product.price, product.callForPrice)}</b>
                  {product.stock > 0 ? (
                    <form action={addToCart}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="next" value={`/products/${product.slug}`} />
                      <input type="hidden" name="quantity" value="1" />
                      <button>{product.callForPrice || product.price == null ? "Add to quote" : "Add to cart"}</button>
                    </form>
                  ) : (
                    <span>Out of stock</span>
                  )}
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
