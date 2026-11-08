import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/form";

export const metadata = { title: "Create account | Nirvana Power Tech" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/account");
  const nextValue = (await searchParams).next;
  const next = safeNext(Array.isArray(nextValue) ? nextValue[0] ?? "" : nextValue ?? "");

  return (
    <section className="shopSection narrow">
      <h1>Create an account</h1>
      <p>Register with your mobile number. You can check out as soon as the account is created.</p>
      <RegisterForm next={nextValue ? next : ""} />
    </section>
  );
}
