"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  UsersIcon,
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

// Animation vars
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

interface Leader {
  id: number;
  name: string;
  title: string;
  image_path: string;
  initial?: string;
}

export default function SuperadminLeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  // Filter leaders based on search query
  const filteredLeaders = leaders.filter(
    (leader) =>
      leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const fetchLeaders = async () => {
    try {
      const response = await axios.get("/landing-page");
      if (response.data && response.data.leaders) {
        setLeaders(response.data.leaders);
      }
    } catch (error) {
      console.error("Failed to fetch leaders", error);
      showToast({ type: "error", message: "Gagal memuat data pimpinan" });
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const handleAddLeader = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsSaving(true);
    try {
      const res = await axios.post("/cms/leaders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLeaders((prev) => [...prev, res.data]);
      showToast({ type: "success", message: "Pimpinan berhasil ditambahkan" });
      setIsAddOpen(false);
    } catch (error) {
      showToast({ type: "error", message: "Gagal menambah pimpinan" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLeader = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pimpinan ini?")) return;
    try {
      await axios.delete(`/cms/leaders/${id}`);
      setLeaders((prev) => prev.filter((p) => p.id !== id));
      showToast({ type: "success", message: "Pimpinan berhasil dihapus" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal menghapus pimpinan" });
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
              Struktur Pimpinan
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Kelola daftar pimpinan perusahaan yang ditampilkan di Landing
              Page.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary">
                <PlusIcon className="h-4 w-4" />
                Tambah Pimpinan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tambah Pimpinan Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan Foto, Nama, dan Jabatan pimpinan baru.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLeader} className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Foto</label>
                  <Input type="file" name="image" accept="image/*" />
                  <p className="text-xs text-slate-500 mt-1">
                    Format: JPG/PNG, Maks. 2MB (Opsional)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Nama Lengkap
                  </label>
                  <Input
                    name="name"
                    placeholder="Contoh: Darmawan Prasodjo"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Jabatan
                  </label>
                  <Input
                    name="title"
                    placeholder="Contoh: Direktur Utama"
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
                  <UsersIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Total Struktur Pimpinan
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {leaders.length}
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
              placeholder="Cari nama atau jabatan pimpinan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Leaders Grid */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {filteredLeaders.length > 0 ? (
            filteredLeaders.map((leader) => (
              <Card
                key={leader.id}
                className="border-0 shadow-lg group hover:shadow-xl transition relative overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="aspect-[3/4] w-full bg-slate-100 relative">
                    {leader.image_path ? (
                      <img
                        src={getImageUrl(leader.image_path)}
                        alt={leader.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        <PhotoIcon className="w-12 h-12" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm rounded-full"
                          >
                            <EllipsisHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2 text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteLeader(leader.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                      {leader.name}
                    </h3>
                    <p className="text-sm text-pln-primary font-medium mt-1">
                      {leader.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              {searchQuery ? (
                <>Tidak ada pimpinan yang cocok dengan "{searchQuery}".</>
              ) : (
                <>Belum ada data pimpinan. Silakan tambah data baru.</>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
