"use client";

import AdminShell from "@/components/admin/AdminShell";
import RoleGuard from "@/components/guards/RoleGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin", "superadmin"]} redirectTo="/dashboard">
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
