"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SessionPayload = {
  user: { name: string; role: "ADMIN" | "CUSTOMER" } | null;
  cartCount: number;
};

export function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [data, setData] = useState<SessionPayload>({ user: null, cartCount: 0 });

  useEffect(() => {
    let active = true;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: SessionPayload) => {
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) setData({ user: null, cartCount: 0 });
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  const firstName = data.user?.name.split(" ")[0];
  return (
    <>
      <Link href="/products" onClick={onNavigate}>
        Shop
      </Link>
      <Link href="/cart" onClick={onNavigate}>
        Cart{data.cartCount > 0 ? ` (${data.cartCount})` : ""}
      </Link>
      {data.user ? (
        <Link href="/account" onClick={onNavigate}>
          {firstName}
        </Link>
      ) : (
        <Link href="/login" onClick={onNavigate}>
          Login
        </Link>
      )}
      <Link href="/admin" onClick={onNavigate}>
        Admin
      </Link>
    </>
  );
}
