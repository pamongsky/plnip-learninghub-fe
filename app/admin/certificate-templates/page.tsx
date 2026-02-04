"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { certificateTemplateApi, type CertificateTemplate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<CertificateTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    is_active: true,
    is_default: false,
  });
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchVariables();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await certificateTemplateApi.getAll();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await certificateTemplateApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchVariables = async () => {
    try {
      const data = await certificateTemplateApi.getVariables();
      setVariables(data);
    } catch (error) {
      console.error("Failed to fetch variables:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("is_active", formData.is_active ? "1" : "0");
    data.append("is_default", formData.is_default ? "1" : "0");

    if (templateFile) {
      data.append("template_file", templateFile);
    }
    if (previewFile) {
      data.append("preview_image", previewFile);
    }

    try {
      if (editingTemplate) {
        await certificateTemplateApi.update(editingTemplate.id, data);
      } else {
        await certificateTemplateApi.create(data);
      }

      setShowDialog(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Gagal menyimpan template");
    }
  };

  const handleEdit = (template: CertificateTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category || "",
      description: template.description || "",
      is_active: template.is_active,
      is_default: template.is_default,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus template ini?")) return;

    try {
      await certificateTemplateApi.delete(id);
      fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Gagal menghapus template");
    }
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      is_active: true,
      is_default: false,
    });
    setTemplateFile(null);
    setPreviewFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            Template Sertifikat
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola template desain sertifikat pelatihan
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-pln-primary hover:bg-pln-primary/90"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tambah Template
        </Button>
      </div>

      {/* Variables Info */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            Variabel Yang Tersedia
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(variables).map(([key, desc]) => (
              <div key={key} className="text-xs">
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-pln-primary">
                  {key}
                </code>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Memuat template...</p>
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DocumentTextIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">Belum ada template</p>
              <p className="text-sm text-slate-400">
                Klik "Tambah Template" untuk membuat template baru
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Preview */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                    {template.preview_path ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${template.preview_path}`}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <PhotoIcon className="h-16 w-16 text-slate-300" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {template.is_default && (
                        <Badge className="bg-amber-500 text-white">
                          Default
                        </Badge>
                      )}
                      {template.is_active ? (
                        <Badge className="bg-emerald-500 text-white">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-500 text-white">
                          Nonaktif
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    {template.category && (
                      <Badge variant="outline" className="mb-2">
                        {template.category}
                      </Badge>
                    )}
                    {template.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(template)}
                        className="flex-1"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Tambah Template Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Kategori Baru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="template_file">
                  File Template (PDF/JPG/PNG){" "}
                  {editingTemplate && "(opsional jika edit)"}
                </Label>
                <Input
                  id="template_file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                  required={!editingTemplate}
                />
              </div>

              <div>
                <Label htmlFor="preview_file">Preview Image (opsional)</Label>
                <Input
                  id="preview_file"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Aktif</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      setFormData({ ...formData, is_default: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Set sebagai default</span>
                </label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-pln-primary hover:bg-pln-primary/90"
              >
                {editingTemplate ? "Update" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
