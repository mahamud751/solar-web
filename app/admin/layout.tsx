import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin | Nirvana Power Tech" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="adminShell">
      <aside>
        <Link href="/" className="brand">
          <b>
            <img src="/nirvana-mark.jpg" alt="" />
          </b>
          <span>
            NIRVANA<small>ADMIN</small>
          </span>
        </Link>
        <AdminNav />
        <form action={logout}>
          <button className="iconBtn">
            <LogOut size={16} />
            Log out {user.name.split(" ")[0]}
          </button>
        </form>
      </aside>
      <div className="adminMain">{children}</div>
    </div>
  );
}
