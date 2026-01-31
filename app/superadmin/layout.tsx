"use client";

import SuperadminShell from "@/components/superadmin/SuperadminShell";
import RoleGuard from "@/components/guards/RoleGuard";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["super-admin"]} redirectTo="/dashboard">
      <SuperadminShell>{children}</SuperadminShell>
    </RoleGuard>
  );
}
