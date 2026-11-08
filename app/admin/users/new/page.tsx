import Link from "next/link";
import { createUser } from "@/app/actions/admin";
import { UserForm } from "@/components/admin/Forms";
import { Notice } from "@/components/shop/Notice";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const error = one((await searchParams).error);
  return (
    <section className="narrow">
      <Link href="/admin/users" className="backLink">
        ← Users
      </Link>
      <h1>New user</h1>
      <Notice error={error} />
      <UserForm action={createUser} />
    </section>
  );
}
