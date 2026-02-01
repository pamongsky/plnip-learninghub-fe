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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "@/lib/axios";
import { AlertCircle, CheckCircle, ShieldCheckIcon } from "lucide-react";

interface UserOverrideRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  currentRole: string;
  accessGroup: string;
  onSuccess: () => void;
}

export function UserOverrideRoleModal({
  open,
  onOpenChange,
  userId,
  userName,
  currentRole,
  accessGroup,
  onSuccess,
}: UserOverrideRoleModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await axios.post(`/superadmin/users/${userId}/override-role`, {
        role,
        reason,
      });

      setMessage({
        type: "success",
        text: "Role berhasil di-override",
      });

      setTimeout(() => {
        setRole("");
        setReason("");
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Gagal melakukan override role",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-pln-primary" />
            Override Role
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
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
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {userName}
            </p>
            <div className="text-xs space-y-1">
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Access Group (ERP):</span>{" "}
                {accessGroup || "N/A"}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Role Saat Ini:</span>{" "}
                {currentRole}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role Baru *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih role baru" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super-admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Alasan *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Alasan melakukan override role (untuk audit trail)"
              className="resize-none"
              rows={3}
              required
            />
            <p className="text-xs text-slate-500">
              Minimum 10 karakter, akan dicatat dalam audit log
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-300">
              ⚠️ Override role hanya untuk user ERP. Role akan berubah saat ERP
              sync berikutnya jika access_group berubah di ERP.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                !role ||
                reason.length < 10 ||
                message?.type === "success"
              }
            >
              {submitting ? "Menyimpan..." : "Override Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
