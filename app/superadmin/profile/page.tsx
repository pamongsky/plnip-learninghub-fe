"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  KeyIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

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

export default function SuperadminProfilePage() {
  const { user } = useAuth();
  const { toast, showToast, clearToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const profileData = {
    name: user?.name || "Super Admin",
    email: user?.email || "superadmin@plnip.co.id",
    phone: "+62 812 3456 7890",
    department: "IT",
    position: "System Administrator",
    employeeId: "PLN-SA-001",
    joinedAt: "2023-01-01",
  };

  const handleSave = () => {
    setIsEditing(false);
    showToast({ type: "success", message: "Profile berhasil diupdate!" });
  };

  return (
    <>
      {toast && <Toast {...toast} onClose={clearToast} />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            Profile
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Kelola informasi profil Anda
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-pln-primary to-pln-light" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-end">
                <div className="-mt-16 relative">
                  <div className="h-32 w-32 rounded-2xl border-4 border-white bg-gradient-to-br from-pln-primary to-pln-light shadow-lg dark:border-slate-800 flex items-center justify-center text-white text-4xl font-bold">
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <button className="absolute bottom-2 right-2 rounded-full bg-white p-2 text-slate-600 shadow-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                    <CameraIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {profileData.name}
                    </h2>
                    <Badge className="bg-pln-100 text-pln-700 dark:bg-pln-900/30 dark:text-pln-400">
                      <ShieldCheckIcon className="mr-1 h-3 w-3" />
                      Super Admin
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    {profileData.position} • {profileData.department}
                  </p>
                </div>
                <div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-pln-primary to-pln-light"
                      >
                        Simpan
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Info */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle>Informasi Pribadi</CardTitle>
                <CardDescription>Data diri Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <UserCircleIcon className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Nama Lengkap</p>
                    {isEditing ? (
                      <Input defaultValue={profileData.name} className="mt-1" />
                    ) : (
                      <p className="font-medium text-slate-900 dark:text-white">
                        {profileData.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {profileData.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <PhoneIcon className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Telepon</p>
                    {isEditing ? (
                      <Input
                        defaultValue={profileData.phone}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-slate-900 dark:text-white">
                        {profileData.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Work Info */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle>Informasi Pekerjaan</CardTitle>
                <CardDescription>Data kepegawaian</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <BuildingOffice2Icon className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {profileData.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <ShieldCheckIcon className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Position</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {profileData.position}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <KeyIcon className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Employee ID</p>
                    <p className="font-mono font-medium text-slate-900 dark:text-white">
                      {profileData.employeeId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
              <CardDescription>
                Kelola password dan keamanan akun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Password
                  </p>
                  <p className="text-sm text-slate-500">
                    Terakhir diubah 30 hari yang lalu
                  </p>
                </div>
                <Button variant="outline">Ubah Password</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
