"use client";

import { useState, useEffect } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { motion } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import axios from "@/lib/axios";
import { getImageUrl } from "@/lib/imageUrl";

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

interface Partner {
  id: number;
  name: string;
  logo_path: string;
}

export default function SuperadminPartnersPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  // Filter partners based on search query
  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const fetchPartners = async () => {
    try {
      const response = await axios.get("/landing-page");
      if (response.data && response.data.partners) {
        setPartners(response.data.partners);
      }
    } catch (error) {
      showToast({ type: "error", message: "Gagal memuat data partner" });
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleAddPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsSaving(true);
    try {
      const res = await axios.post("/cms/partners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPartners((prev) => [...prev, res.data]);
      showToast({ type: "success", message: "Partner berhasil ditambahkan" });
      setIsAddOpen(false);
    } catch (error) {
      showToast({ type: "error", message: "Gagal menambah partner" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePartner = async (id: number) => {
    const confirmed = await confirm({ title: "Hapus Partner", description: "Apakah Anda yakin ingin menghapus partner ini?", confirmText: "Ya, Hapus", variant: "destructive" });
    if (!confirmed) return;
    try {
      await axios.delete(`/cms/partners/${id}`);
      setPartners((prev) => prev.filter((p) => p.id !== id));
      showToast({ type: "success", message: "Partner berhasil dihapus" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal menghapus partner" });
    }
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
              Partner Institusi
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Kelola partner dan institusi kerjasama yang ditampilkan di Landing
              Page.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary">
                <PlusIcon className="h-4 w-4" />
                Tambah Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tambah Partner Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan Logo dan Nama Institusi partner baru.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPartner} className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Logo Institusi
                  </label>
                  <Input type="file" name="logo" accept="image/*" required />
                  <p className="text-xs text-slate-500 mt-1">
                    Format: JPG/PNG, Maks. 2MB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Nama Institusi
                  </label>
                  <Input
                    name="name"
                    placeholder="Contoh: Universitas Indonesia"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-pln-primary to-pln-light"
                    disabled={isSaving}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-pln-primary to-pln-light shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <BuildingOffice2Icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Total Partner Institusi
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {partners.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants}>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Partners Grid */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => (
              <Card
                key={partner.id}
                className="border-0 shadow-lg group hover:shadow-xl transition relative overflow-hidden"
              >
                <CardContent className="p-6 flex flex-col items-center text-center h-full justify-center gap-4">
                  <div className="flex h-24 w-full items-center justify-center p-2 bg-slate-50 rounded-lg">
                    {partner.logo_path ? (
                      <img
                        src={getImageUrl(partner.logo_path)}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <PhotoIcon className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {partner.name}
                  </h3>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                        >
                          <EllipsisHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2 text-red-600 focus:text-red-600"
                          onClick={() => handleDeletePartner(partner.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              {searchQuery ? (
                <>Tidak ada partner yang cocok dengan "{searchQuery}".</>
              ) : (
                <>Belum ada data partner. Silakan tambah partner baru.</>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
      <ConfirmDialog />
    </>
  );
}
