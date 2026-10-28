import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  const email = session.user?.email ?? "";

  return (
    <AdminShell
      user={{
        name: session.user?.name ?? (email.split("@")[0] || "Admin"),
        email,
        role: "Admin",
      }}
      logoutAction={logout}
    >
      {children}
    </AdminShell>
  );
}
