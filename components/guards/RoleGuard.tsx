"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type RoleGuardProps = {
  allowedRoles: string[];
  redirectTo?: string;
  children: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  redirectTo = "/dashboard",
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const roles = user.roles || [];
    const allowed = roles.some((role) => allowedRoles.includes(role));
    if (!allowed) {
      router.replace(redirectTo);
    }
  }, [allowedRoles, loading, redirectTo, router, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Checking access...</div>
      </div>
    );
  }

  const roles = user.roles || [];
  const allowed = roles.some((role) => allowedRoles.includes(role));

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
