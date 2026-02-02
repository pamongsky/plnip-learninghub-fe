"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", display_name: "" });
  const [selectedDefaultPerms, setSelectedDefaultPerms] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axios.get("/superadmin/roles"),
        axios.get("/superadmin/roles/permissions/all"),
      ]);

      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
      setLoading(false);
    } catch (error: any) {
      console.error(
        "Failed to fetch roles:",
        error.response?.data?.message || error.message,
      );
      setLoading(false);
    }
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
  };

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.display_name) {
      alert("Nama role dan display name harus diisi");
      return;
    }

    try {
      setSaving(true);
      await axios.post("/superadmin/roles", {
        name: newRole.name,
        display_name: newRole.display_name,
        permissions: selectedDefaultPerms,
      });

      alert("Role berhasil dibuat!");
      setNewRole({ name: "", display_name: "" });
      setSelectedDefaultPerms([]);
      setShowCreateForm(false);
      await fetchData();
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Gagal membuat role"
      );
      console.error("Failed to create role:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleDefaultPermission = (permName: string) => {
    setSelectedDefaultPerms((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName],
    );
  };

  const getPermissionsByCategory = (categoryName: string) => {
    return permissions.filter((p) => p.category === categoryName);
  };

  const categories = [...new Set(permissions.map((p) => p.category))];
  const filteredRoles = roles.filter((r) =>
    r.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            Roles & Permissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View available roles and their permissions
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Create Custom Role
        </Button>
      </div>

      {/* Create Role Form */}
      {showCreateForm && (
        <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Create New Custom Role</CardTitle>
            <CardDescription>
              Define a new role with selected default permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name (lowercase, no spaces)
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({
                      ...newRole,
                      name: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  placeholder="e.g., content-manager"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newRole.display_name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, display_name: e.target.value })
                  }
                  placeholder="e.g., Content Manager"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Default Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Default Permissions ({selectedDefaultPerms.length})
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDefaultPerms.includes(perm.name)}
                      onChange={() => toggleDefaultPermission(perm.name)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {perm.display_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {perm.category}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateRole}
                disabled={saving || !newRole.name || !newRole.display_name}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? "Creating..." : "Create Role"}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewRole({ name: "", display_name: "" });
                  setSelectedDefaultPerms([]);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Available Roles
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
              onClick={() => handleSelectRole(role)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{role.display_name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {role.user_count} user{role.user_count !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {role.permissions.length} perms
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

      {/* Selected Role Details */}
      {selectedRole && (
        <Card className="border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-950">
          <CardHeader>
            <CardTitle className="text-2xl">{selectedRole.display_name}</CardTitle>
            <CardDescription className="mt-2">
              {selectedRole.description}
            </CardDescription>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase">
                      {category} ({assignedPerms.length}/{categoryPerms.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {assignedPerms.length > 0 ? (
                        assignedPerms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg"
                          >
                            <CheckIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {perm.display_name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic col-span-full">
                          No permissions in this category
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setSelectedRole(null)}
                variant="outline"
              >
                Close
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">
                💡 Untuk mengatur permissions role ini, gunakan fitur Management di Admin Panel nanti.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
