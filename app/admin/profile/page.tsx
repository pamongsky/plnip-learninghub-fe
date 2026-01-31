"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserCircleIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  PencilSquareIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Profile Saya
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Kelola informasi akun Anda
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-3xl font-bold text-white shadow-lg shadow-pln-primary/30">
                    {initials}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    {user?.name || "Admin User"}
                  </h2>
                  <p className="text-slate-500">{user?.email}</p>
                  <div className="mt-3 flex gap-2">
                    <Badge className="bg-pln-100 text-pln-700 hover:bg-pln-100">
                      Administrator
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Verified
                    </Badge>
                  </div>

                  <div className="mt-6 w-full border-t border-slate-200 pt-6 dark:border-slate-700">
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <BuildingOfficeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Departemen</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            Corporate
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <IdentificationIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Employee ID</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            PLN-2024-001
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <ShieldCheckIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Status</p>
                          <p className="font-medium text-pln-primary">Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Info */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Informasi Personal</CardTitle>
                  <CardDescription>Update data diri Anda</CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    "Simpan"
                  ) : (
                    <>
                      <PencilSquareIcon className="mr-2 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nama Lengkap
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <UserCircleIcon className="h-5 w-5 text-slate-400" />
                      <Input
                        defaultValue={user?.name || "Admin User"}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                      <Input
                        defaultValue={user?.email || "admin@plnip.co.id"}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No. Telepon
                    </label>
                    <Input
                      defaultValue="+62 812 3456 7890"
                      disabled={!isEditing}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Posisi
                    </label>
                    <Input
                      defaultValue="Admin Unit"
                      disabled
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Keamanan</CardTitle>
                <CardDescription>
                  Kelola password dan keamanan akun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <KeyIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Password
                      </p>
                      <p className="text-sm text-slate-500">
                        Terakhir diubah 30 hari yang lalu
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ubah Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Notifikasi</CardTitle>
                <CardDescription>
                  Atur preferensi notifikasi Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <EnvelopeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Email Notifications
                        </p>
                        <p className="text-sm text-slate-500">
                          Terima update via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <BellIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Push Notifications
                        </p>
                        <p className="text-sm text-slate-500">
                          Terima notifikasi browser
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
