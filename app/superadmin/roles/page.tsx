"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  user_count: number;
  permissions: string[];
}

interface Permission {
  id: number;
  name: string;
  display_name: string;
  category: string;
}

export default function SuperadminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axios.get("/superadmin/roles"),
        axios.get("/superadmin/roles/permissions/all"),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
          Roles &amp; Permissions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Lihat daftar role dan permission yang dimiliki masing-masing role.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Daftar Role
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all ${
                selectedRole?.id === role.id
                  ? "ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950/20"
                  : "hover:shadow-md"
              }`}
              onClick={() =>
                setSelectedRole(selectedRole?.id === role.id ? null : role)
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {role.display_name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {role.user_count} pengguna
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {role.permissions.length} izin
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {role.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Role Detail — read-only */}
      {selectedRole && (
        <Card className="border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-2xl">{selectedRole.display_name}</CardTitle>
            <CardDescription className="mt-2">{selectedRole.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[...new Set(permissions.map((p) => p.category))].map((category) => {
                const categoryPerms = permissions.filter((p) => p.category === category);
                const assignedPerms = categoryPerms.filter((p) =>
                  selectedRole.permissions.includes(p.name),
                );

                return (
                  <div key={category}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                      {category}{" "}
                      <span className="text-gray-400 font-normal">
                        ({assignedPerms.length}/{categoryPerms.length})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {assignedPerms.length > 0 ? (
                        assignedPerms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg"
                          >
                            <CheckIcon className="h-4 w-4 text-green-600 shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {perm.display_name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic col-span-full">
                          Tidak ada permission di kategori ini
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => setSelectedRole(null)} variant="outline">
                Tutup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
