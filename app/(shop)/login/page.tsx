import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/form";

export const metadata = { title: "Log in | Nirvana Power Tech" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  const nextValue = (await searchParams).next;
  const next = safeNext(Array.isArray(nextValue) ? nextValue[0] ?? "" : nextValue ?? "");
  if (user) redirect(nextValue ? next : user.role === "ADMIN" ? "/admin" : "/account");

  return (
    <section className="shopSection narrow">
      <h1>Log in</h1>
      <p>Use your Nirvana Power Tech account to order street lights and track delivery.</p>
      <LoginForm next={nextValue ? next : ""} />
    </section>
  );
}
