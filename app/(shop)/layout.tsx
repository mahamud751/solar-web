import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="inner shopMain">{children}</main>
      <SiteFooter />
    </>
  );
}
