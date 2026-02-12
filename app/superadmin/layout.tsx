"use client";

import SuperadminShell from "@/components/superadmin/SuperadminShell";
import RoleGuard from "@/components/guards/RoleGuard";
import AIChatWidget from "@/components/AIChatWidget";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["super-admin"]} redirectTo="/dashboard">
      <SuperadminShell>{children}</SuperadminShell>
      <AIChatWidget />
    </RoleGuard>
  );
}
