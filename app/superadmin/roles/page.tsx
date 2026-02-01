"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [activeTab, setActiveTab] = useState<"view" | "manage">("view");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

      if (selectedRole) {
        const updated = rolesRes.data.find(
          (r: Role) => r.id === selectedRole.id,
        );
        if (updated) {
          setSelectedRole(updated);
          setSelectedPermissions(updated.permissions);
        }
      }

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
    setSelectedPermissions(role.permissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      await axios.put(`/superadmin/roles/${selectedRole.id}/permissions`, {
        permissions: selectedPermissions,
      });

      console.log("Permissions updated successfully");
      await fetchData();
    } catch (error: any) {
      console.error(
        "Failed to update permissions:",
        error.response?.data?.message || error.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      setSaving(true);
      await axios.delete(`/superadmin/roles/${role.id}`);

      console.log("Role deleted successfully");
      await fetchData();
      setDeleteConfirm(null);
      setSelectedRole(null);
    } catch (error: any) {
      console.error(
        "Failed to delete role:",
        error.response?.data?.message || error.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
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
            Manage system roles and their permissions
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("view")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "view"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          View Roles
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "manage"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Manage Permissions
        </button>
      </div>

      {/* VIEW TAB */}
      {activeTab === "view" && (
        <div className="space-y-6">
          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRoles.map((role) => (
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
                      <CardTitle className="text-lg">
                        {role.display_name}
                      </CardTitle>
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

          {/* Selected Role Details */}
          {selectedRole && (
            <Card className="border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-950">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedRole.display_name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedRole.description}
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("manage")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryPerms = getPermissionsByCategory(category);
                    const assignedPerms = categoryPerms.filter((p) =>
                      selectedRole.permissions.includes(p.name),
                    );

                    return (
                      <div key={category}>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm uppercase">
                          {category}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                            <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full italic">
                              No permissions
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* MANAGE TAB */}
      {activeTab === "manage" && (
        <div className="space-y-6">
          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Role to Edit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedRole?.id === role.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {role.display_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {role.permissions.length} permissions
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permission Manager */}
          {selectedRole && (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedRole.display_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Configure permissions for this role
                    </CardDescription>
                  </div>
                  <Badge variant="default">
                    {selectedPermissions.length} selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Permissions by Category */}
                {categories.map((category) => {
                  const categoryPerms = getPermissionsByCategory(
                    category,
                  ).filter((p) =>
                    p.display_name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  );

                  if (categoryPerms.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryPerms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(perm.name)}
                              onChange={() => togglePermission(perm.name)}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {perm.display_name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {perm.name}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRole(null);
                      setSelectedPermissions([]);
                      setSearchQuery("");
                    }}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  {selectedRole.name !== "super-admin" && (
                    <button
                      onClick={() => setDeleteConfirm(selectedRole)}
                      className="ml-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete Role
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the {deleteConfirm?.display_name}{" "}
              role? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Users with this role will lose their permissions.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteRole(deleteConfirm)}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
