"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function SuperadminSettingsPage() {
  const { toast, showToast, clearToast } = useToast();

  // Settings state
  const [settings, setSettings] = useState({
    // General
    siteName: "PLN IP Learning Hub",
    siteDescription: "Platform learning terintegrasi untuk PLN Indonesia Power",
    maintenanceMode: false,

    // Notifications
    emailNotifications: true,
    systemAlerts: true,
    syncNotifications: true,

    // Security
    twoFactorAuth: false,
    sessionTimeout: "60",
    passwordExpiry: "90",

    // Moodle
    moodleAutoSync: true,
    syncInterval: "4",

    // Appearance
    primaryColor: "#0ea5e9",
    darkModeDefault: false,
  });

  const handleSave = () => {
    showToast({ type: "success", message: "Settings berhasil disimpan!" });
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
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Konfigurasi sistem platform
            </p>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary"
            onClick={handleSave}
          >
            Simpan Perubahan
          </Button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* General Settings */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog6ToothIcon className="h-5 w-5" />
                  General
                </CardTitle>
                <CardDescription>Pengaturan umum platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Nama Site</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) =>
                      setSettings({ ...settings, siteName: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Input
                    value={settings.siteDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        siteDescription: e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Maintenance Mode
                    </p>
                    <p className="text-sm text-slate-500">
                      Nonaktifkan akses user sementara
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, maintenanceMode: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellIcon className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Pengaturan notifikasi sistem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Email Notifications
                    </p>
                    <p className="text-sm text-slate-500">
                      Kirim notifikasi via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      System Alerts
                    </p>
                    <p className="text-sm text-slate-500">
                      Notifikasi untuk error sistem
                    </p>
                  </div>
                  <Switch
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, systemAlerts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Sync Notifications
                    </p>
                    <p className="text-sm text-slate-500">
                      Notifikasi status sync Moodle
                    </p>
                  </div>
                  <Switch
                    checked={settings.syncNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, syncNotifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Pengaturan keamanan platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Two-Factor Auth (2FA)
                    </p>
                    <p className="text-sm text-slate-500">
                      Wajibkan 2FA untuk semua user
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, twoFactorAuth: checked })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Session Timeout (menit)
                  </label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) =>
                      setSettings({ ...settings, sessionTimeout: value })
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 menit</SelectItem>
                      <SelectItem value="60">60 menit</SelectItem>
                      <SelectItem value="120">2 jam</SelectItem>
                      <SelectItem value="480">8 jam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Password Expiry (hari)
                  </label>
                  <Select
                    value={settings.passwordExpiry}
                    onValueChange={(value) =>
                      setSettings({ ...settings, passwordExpiry: value })
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 hari</SelectItem>
                      <SelectItem value="60">60 hari</SelectItem>
                      <SelectItem value="90">90 hari</SelectItem>
                      <SelectItem value="never">Tidak expire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Moodle Integration */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ServerIcon className="h-5 w-5" />
                  Moodle Integration
                </CardTitle>
                <CardDescription>
                  Pengaturan integrasi dengan Moodle LMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Auto Sync
                    </p>
                    <p className="text-sm text-slate-500">
                      Sinkronisasi otomatis terjadwal
                    </p>
                  </div>
                  <Switch
                    checked={settings.moodleAutoSync}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, moodleAutoSync: checked })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Sync Interval (jam)
                  </label>
                  <Select
                    value={settings.syncInterval}
                    onValueChange={(value) =>
                      setSettings({ ...settings, syncInterval: value })
                    }
                    disabled={!settings.moodleAutoSync}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Setiap 1 jam</SelectItem>
                      <SelectItem value="2">Setiap 2 jam</SelectItem>
                      <SelectItem value="4">Setiap 4 jam</SelectItem>
                      <SelectItem value="6">Setiap 6 jam</SelectItem>
                      <SelectItem value="12">Setiap 12 jam</SelectItem>
                      <SelectItem value="24">Setiap 24 jam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Appearance */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaintBrushIcon className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Kustomisasi tampilan platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="h-10 w-20 cursor-pointer rounded border border-slate-200"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-32"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Dark Mode Default
                    </p>
                    <p className="text-sm text-slate-500">
                      Gunakan dark mode sebagai default
                    </p>
                  </div>
                  <Switch
                    checked={settings.darkModeDefault}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, darkModeDefault: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
