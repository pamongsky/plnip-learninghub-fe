"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { AlertCircle, CheckCircle } from "lucide-react";

interface UserDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  onSuccess: () => void;
}

export function UserDeleteModal({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: UserDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setMessage(null);

    try {
      await axios.delete(`/superadmin/users/${userId}`);
      setMessage({
        type: "success",
        text: "User berhasil dihapus",
      });

      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Gagal menghapus user",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Hapus User?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {message ? (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {message.text}
            </div>
          ) : (
            <>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {userName}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Pengguna manual ini akan dihapus secara permanen. Tindakan ini
                  tidak dapat dibatalkan.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  ⚠️ Catatan: Hanya user dengan source &quot;manual&quot; yang
                  dapat dihapus. User dari ERP tidak bisa dihapus (akan
                  tersinkronisasi ulang).
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || message?.type === "success"}
          >
            {deleting ? "Menghapus..." : "Ya, Hapus User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
