"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "@/lib/axios";
import {
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  position: string;
  role?: string;
  effective_role?: string;
  is_active: boolean;
  source: "manual" | "erp";
  access_group?: string;
  role_override?: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  action: string;
  changes: any;
  reason: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

export function UserDetailsModal({
  open,
  onOpenChange,
  userId,
}: UserDetailsModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const [userRes, auditRes] = await Promise.all([
        axios.get(`/superadmin/users/${userId}`),
        axios.get(`/superadmin/users/${userId}/audit-history`),
      ]);

      setUser(userRes.data);
      setAuditLogs(auditRes.data || []);
    } catch (error: any) {
      console.error("Failed to fetch user details:", error);
      // Still try to set user data if available
      if (error.response?.data) {
        setUser(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail User</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Memuat detail user...
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-lg font-bold text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge className="bg-pln-100 text-pln-700 dark:bg-pln-900/30 dark:text-pln-400">
                    {user.effective_role || "user"}
                  </Badge>
                  {user.source === "erp" ? (
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      ERP
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      Manual
                    </Badge>
                  )}
                  {user.is_active ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Nonaktif</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Employee ID
                </p>
                <div className="flex items-center gap-2">
                  <IdentificationIcon className="h-4 w-4 text-slate-400" />
                  <span className="font-mono text-sm">
                    {user.employee_id || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Unit
                </p>
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm">{user.department || "-"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Jabatan
                </p>
                <span className="text-sm">{user.position || "-"}</span>
              </div>

              {user.source === "erp" && (
                <>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Access Group (ERP)
                    </p>
                    <span className="text-sm">{user.access_group || "-"}</span>
                  </div>

                  {user.role_override && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        Role Override
                      </p>
                      <span className="text-sm text-orange-600">
                        {user.role_override}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Dibuat
                </p>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Audit History */}
            {auditLogs.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Riwayat Audit ({auditLogs.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <Card
                      key={log.id}
                      className="border-0 shadow-sm bg-slate-50 dark:bg-slate-900/20"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">
                                {log.action}
                              </span>
                              <span className="text-xs text-slate-500">
                                oleh {log.user?.name || "System"}
                              </span>
                            </div>
                            {log.reason && (
                              <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                                {log.reason}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {formatDate(log.created_at)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
