"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BuildingOffice2Icon,
  PhotoIcon,
  PencilSquareIcon,
  CheckIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

// Mock data (temporary, will replace with API)
import axios from "@/lib/axios";

// ... imports

const companyData = {
  appName: "PLN Learning Hub",
  appLogo: null,
  name: "PT PLN Indonesia Power",
  // ... existing fields
  shortName: "PLN IP",
  tagline: "Menggerakkan Talenta Energi Masa Depan",
  description:
    "PLN Indonesia Power adalah anak perusahaan PT PLN (Persero) yang bergerak di bidang pembangkitan tenaga listrik. Kami berkomitmen untuk mengembangkan kompetensi sumber daya manusia melalui platform learning terintegrasi.",
  logo: "/images/pln-logo.png",
  website: "https://www.plnip.co.id",
  email: "info@plnip.co.id",
  phone: "+62 21 7251234",
  address: "Jl. Jend. Gatot Subroto Kav. 18, Jakarta 12950, Indonesia",
  socialMedia: {
    instagram: "@plnip_official",
    linkedin: "PLN Indonesia Power",
    youtube: "PLN Indonesia Power",
    tiktok: "plnip",
  },
};

// ... imports

export default function SuperadminHomePage() {
  const [formData, setFormData] = useState(companyData);
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [heroSettings, setHeroSettings] = useState({
    title: "Menggerakkan Talenta Energi Masa Depan",
    subtitle:
      "Platform learning terintegrasi untuk memperkuat kompetensi, sertifikasi, dan inovasi di lingkungan PLN Indonesia Power.",
  });

  // Settings for Features
  const [featureSettings, setFeatureSettings] = useState({
    f1_title: "Digital Learning",
    f1_desc:
      "Ribuan modul teknis dan non-teknis yang bisa diakses kapan saja, di mana saja.",
    f2_title: "Sertifikasi",
    f2_desc:
      "Uji kompetensi terstandarisasi untuk jenjang karir yang jelas dan terukur.",
    f3_title: "AI Mentor",
    f3_desc:
      "Pendamping belajar berbasis AI untuk pertanyaan teknis dan rekomendasi karir.",
    f4_title: "Progress Tracking",
    f4_desc: "Pantau perkembangan belajar Anda dengan dashboard yang intuitif.",
  });

  // Settings for Stats
  const [statSettings, setStatSettings] = useState({
    s1_val: "50K+",
    s1_label: "Talenta Aktif",
    s2_val: "1K",
    s2_label: "Modul Pembelajaran",
    s3_val: "240+",
    s3_label: "Mentor Ahli",
    s4_val: "350+",
    s4_label: "Sertifikasi",
  });

  // Settings for Partnership Stats
  const [partnershipSettings, setPartnershipSettings] = useState({
    p1_val: "100",
    p1_label: "Partner Institusi",
    p2_val: "50",
    p2_label: "Kementerian & BUMN",
    p3_val: "30",
    p3_label: "Universitas",
    p4_val: "20",
    p4_label: "Tech Partners",
  });

  const [partners, setPartners] = useState<any[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    fetchCmsData();
  }, []);

  const fetchCmsData = async () => {
    try {
      const res = await axios.get("/landing-page");
      const data = res.data;

      if (data.settings) {
        setFormData((prev) => ({
          ...prev,
          appName: data.settings.app_name || prev.appName,
          appLogo: data.settings.app_logo || prev.appLogo,
          name: data.settings.company_name || prev.name,
          tagline: data.settings.company_tagline || prev.tagline,
          description: data.settings.company_description || prev.description,
          email: data.settings.company_email || prev.email,
          phone: data.settings.company_phone || prev.phone,
          website: data.settings.company_website || prev.website,
          address: data.settings.company_address || prev.address,
          socialMedia: {
            instagram:
              data.settings.social_instagram || prev.socialMedia.instagram,
            linkedin:
              data.settings.social_linkedin || prev.socialMedia.linkedin,
            youtube: data.settings.social_youtube || prev.socialMedia.youtube,
            tiktok: data.settings.social_tiktok || prev.socialMedia.tiktok,
          },
        }));
        setHeroSettings({
          title:
            data.settings.hero_title ||
            "Menggerakkan Talenta Energi Masa Depan",
          subtitle:
            data.settings.hero_description ||
            "Platform learning terintegrasi untuk memperkuat kompetensi, sertifikasi, dan inovasi di lingkungan PLN Indonesia Power.",
        });
        setFeatureSettings({
          f1_title: data.settings.f1_title || "Digital Learning",
          f1_desc:
            data.settings.f1_desc ||
            "Ribuan modul teknis dan non-teknis yang bisa diakses kapan saja, di mana saja.",
          f2_title: data.settings.f2_title || "Sertifikasi",
          f2_desc:
            data.settings.f2_desc ||
            "Uji kompetensi terstandarisasi untuk jenjang karir yang jelas dan terukur.",
          f3_title: data.settings.f3_title || "AI Mentor",
          f3_desc:
            data.settings.f3_desc ||
            "Pendamping belajar berbasis AI untuk pertanyaan teknis dan rekomendasi karir.",
          f4_title: data.settings.f4_title || "Progress Tracking",
          f4_desc:
            data.settings.f4_desc ||
            "Pantau perkembangan belajar Anda dengan dashboard yang intuitif.",
        });
        setStatSettings({
          s1_val: data.settings.s1_val || "50K+",
          s1_label: data.settings.s1_label || "Talenta Aktif",
          s2_val: data.settings.s2_val || "1K",
          s2_label: data.settings.s2_label || "Modul Pembelajaran",
          s3_val: data.settings.s3_val || "240+",
          s3_label: data.settings.s3_label || "Mentor Ahli",
          s4_val: data.settings.s4_val || "350+",
          s4_label: data.settings.s4_label || "Sertifikasi",
        });
        setPartnershipSettings({
          p1_val: data.settings.p1_val || "100",
          p1_label: data.settings.p1_label || "Partner Institusi",
          p2_val: data.settings.p2_val || "50",
          p2_label: data.settings.p2_label || "Kementerian & BUMN",
          p3_val: data.settings.p3_val || "30",
          p3_label: data.settings.p3_label || "Universitas",
          p4_val: data.settings.p4_val || "20",
          p4_label: data.settings.p4_label || "Tech Partners",
        });
      }
      if (data.hero_images) setHeroImages(data.hero_images);

      if (data.partners) setPartners(data.partners);
    } catch (error) {
      console.error("Failed to fetch CMS data", error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("key", "app_logo");

    setIsUploading(true);
    try {
      const response = await axios.post("/cms/settings/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, appLogo: response.data.url }));
      showToast({ type: "success", message: "Logo berhasil diupload!" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal upload logo." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await axios.post("/cms/settings", {
        settings: {
          // ... same as before ...
          app_name: formData.appName,
          company_name: formData.name,
          company_tagline: formData.tagline,
          company_description: formData.description,
          company_email: formData.email,
          company_phone: formData.phone,
          company_website: formData.website,
          company_address: formData.address,
          social_instagram: formData.socialMedia.instagram,
          social_linkedin: formData.socialMedia.linkedin,
          social_youtube: formData.socialMedia.youtube,
          social_tiktok: formData.socialMedia.tiktok,
          app_logo: formData.appLogo,
        },
      });
      showToast({ type: "success", message: "Settings saved successfully!" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal menyimpan settings." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (heroImages.length >= 8) {
      showToast({ type: "error", message: "Maksimal 8 foto." });
      return;
    }

    const uploadData = new FormData();
    uploadData.append("image", file);
    uploadData.append("title", "Hero Image");

    setIsUploading(true);
    try {
      const response = await axios.post("/cms/hero-images", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHeroImages((prev) => [...prev, response.data]);
      showToast({ type: "success", message: "Foto berhasil diupload!" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal upload foto." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteHeroImage = async (id: number) => {
    if (!confirm("Hapus foto ini?")) return;
    try {
      await axios.delete(`/cms/hero-images/${id}`);
      setHeroImages((prev) => prev.filter((img) => img.id !== id));
      showToast({ type: "success", message: "Foto dihapus." });
    } catch (error) {
      showToast({ type: "error", message: "Gagal hapus foto." });
    }
  };

  const handleSaveHeroSettings = async () => {
    setIsSaving(true);
    try {
      await axios.post("/cms/settings", {
        settings: {
          hero_title: heroSettings.title,
          hero_description: heroSettings.subtitle,
        },
      });
      showToast({ type: "success", message: "Text Hero disimpan!" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
    setIsSaving(true);
    try {
      await axios.post("/cms/settings", {
        settings: featureSettings,
      });
      showToast({ type: "success", message: "Fitur Unggulan disimpan!" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStats = async () => {
    setIsSaving(true);
    try {
      await axios.post("/cms/settings", {
        settings: statSettings,
      });
      showToast({ type: "success", message: "Statistik disimpan!" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePartnership = async () => {
    setIsSaving(true);
    try {
      await axios.post("/cms/settings", {
        settings: partnershipSettings,
      });
      showToast({ type: "success", message: "Partnership Stats disimpan!" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStorePartner = async (e: React.FormEvent<HTMLFormElement>) => {
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
      form.reset();
    } catch (error) {
      showToast({ type: "error", message: "Gagal menambah partner" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePartner = async (id: number) => {
    if (!confirm("Hapus partner ini?")) return;
    try {
      await axios.delete(`/cms/partners/${id}`);
      setPartners((prev) => prev.filter((p) => p.id !== id));
      showToast({ type: "success", message: "Dihapus" });
    } catch (error) {
      showToast({ type: "error", message: "Gagal hapus" });
    }
  };

  return (
    <>
      {toast && <Toast {...toast} onClose={clearToast} />}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            Home Editor
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Kelola konten halaman depan (Landing Page)
          </p>
        </div>

        <Tabs defaultValue="company" className="w-full space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
            <TabsTrigger
              value="company"
              className="data-[state=active]:bg-pln-primary data-[state=active]:text-white"
            >
              Info Perusahaan
            </TabsTrigger>
            <TabsTrigger
              value="hero"
              className="data-[state=active]:bg-pln-primary data-[state=active]:text-white"
            >
              Hero Section
            </TabsTrigger>

            <TabsTrigger
              value="features"
              className="data-[state=active]:bg-pln-primary data-[state=active]:text-white"
            >
              Fitur & Statistik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            {/* Ported Content from Company Page */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Identitas Perusahaan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nama Aplikasi</label>
                    <Input
                      value={formData.appName}
                      placeholder="PLN Learning Hub"
                      onChange={(e) =>
                        setFormData({ ...formData, appName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Logo Aplikasi</label>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="h-16 w-16 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {formData.appLogo ? (
                          <img
                            src={formData.appLogo}
                            alt="Logo"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <PhotoIcon className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="logo-upload"
                          onChange={handleLogoUpload}
                        />
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {isUploading ? "Mengupload..." : "Ganti Logo"}
                        </label>
                        <p className="mt-1 text-xs text-slate-500">
                          Format: PNG/JPG, Max: 2MB.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <label className="text-sm font-medium">
                      Nama Perusahaan
                    </label>
                    <Input
                      value={formData.name}
                      className="mt-1"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tagline</label>
                    <Input
                      value={formData.tagline}
                      placeholder="Menggerakkan Talenta Energi Masa Depan"
                      className="mt-1"
                      onChange={(e) =>
                        setFormData({ ...formData, tagline: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Deskripsi Singkat
                    </label>
                    <Textarea
                      rows={4}
                      value={formData.description}
                      placeholder="Deskripsi perusahaan untuk footer"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Kontak & Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telepon</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alamat</label>
                    <Textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-sm font-medium mb-2 block">
                      Social Media
                    </label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Instagram"
                        value={formData.socialMedia.instagram}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialMedia: {
                              ...formData.socialMedia,
                              instagram: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="LinkedIn"
                        value={formData.socialMedia.linkedin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialMedia: {
                              ...formData.socialMedia,
                              linkedin: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="YouTube"
                        value={formData.socialMedia.youtube}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialMedia: {
                              ...formData.socialMedia,
                              youtube: e.target.value,
                            },
                          })
                        }
                      />
                      <Input
                        placeholder="TikTok"
                        value={formData.socialMedia.tiktok}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialMedia: {
                              ...formData.socialMedia,
                              tiktok: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teks Hero Section</CardTitle>
                <CardDescription>
                  Ubah judul dan deskripsi utama di halaman depan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Judul Utama (Title)
                  </label>
                  <Input
                    value={heroSettings.title}
                    onChange={(e) =>
                      setHeroSettings({
                        ...heroSettings,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Deskripsi (Subtitle)
                  </label>
                  <Textarea
                    value={heroSettings.subtitle}
                    onChange={(e) =>
                      setHeroSettings({
                        ...heroSettings,
                        subtitle: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleSaveHeroSettings} disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Teks"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Carousel Images</CardTitle>
                <CardDescription>
                  Upload hingga 8 gambar untuk carousel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {heroImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-video rounded-lg overflow-hidden group border border-slate-200"
                    >
                      <img
                        src={img.image_path}
                        alt={img.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDeleteHeroImage(img.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.49 1.478l-.196-.043-1.096 11.233a4.75 4.75 0 0 1-4.58 4.29H9.932a4.75 4.75 0 0 1-4.59-4.309l-1.055-11.225-.227.042a.75.75 0 0 1-.49-1.478 48.529 48.529 0 0 1 3.872-.512v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.536 4.314 1.026 10.91A3.25 3.25 0 0 0 11.139 21h1.723a3.25 3.25 0 0 0 3.25-3.076l1.07-10.966-8.32 1.018Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {heroImages.length < 8 && (
                    <div className="relative aspect-video rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleHeroImageUpload}
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <span className="text-sm text-slate-500">
                          Uploading...
                        </span>
                      ) : (
                        <>
                          <PhotoIcon className="h-8 w-8 text-slate-400" />
                          <span className="text-xs text-slate-500 mt-1">
                            Upload Foto
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fitur Unggulan</CardTitle>
                <CardDescription>
                  Edit teks untuk 4 fitur utama di halaman depan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border rounded-lg bg-slate-50">
                    <h4 className="font-semibold mb-2 text-pln-primary">
                      Fitur {i}
                    </h4>
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-medium uppercase text-slate-500">
                          Judul
                        </label>
                        <Input
                          value={(featureSettings as any)[`f${i}_title`]}
                          onChange={(e) =>
                            setFeatureSettings({
                              ...featureSettings,
                              [`f${i}_title`]: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium uppercase text-slate-500">
                          Deskripsi
                        </label>
                        <Textarea
                          rows={2}
                          value={(featureSettings as any)[`f${i}_desc`]}
                          onChange={(e) =>
                            setFeatureSettings({
                              ...featureSettings,
                              [`f${i}_desc`]: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button onClick={handleSaveFeatures} disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Fitur"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistik Impact</CardTitle>
                <CardDescription>
                  Edit angka dan label untuk bagian "Dampak Pembelajaran".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 border rounded-lg bg-slate-50">
                      <h4 className="font-semibold mb-2 text-pln-primary">
                        Statistik {i}
                      </h4>
                      <div className="grid gap-2">
                        <div>
                          <label className="text-xs font-medium uppercase text-slate-500">
                            Angka (Value)
                          </label>
                          <Input
                            value={(statSettings as any)[`s${i}_val`]}
                            onChange={(e) =>
                              setStatSettings({
                                ...statSettings,
                                [`s${i}_val`]: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase text-slate-500">
                            Label
                          </label>
                          <Input
                            value={(statSettings as any)[`s${i}_label`]}
                            onChange={(e) =>
                              setStatSettings({
                                ...statSettings,
                                [`s${i}_label`]: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSaveStats} disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Statistik"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partnership Stats</CardTitle>
                <CardDescription>
                  Edit angka dan label untuk bagian "Dampak Pembelajaran Kami"
                  (100+ Partner Institusi, dll).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 border rounded-lg bg-slate-50">
                      <h4 className="font-semibold mb-2 text-pln-primary">
                        Partnership {i}
                      </h4>
                      <div className="grid gap-2">
                        <div>
                          <label className="text-xs font-medium uppercase text-slate-500">
                            Angka (Value)
                          </label>
                          <Input
                            value={(partnershipSettings as any)[`p${i}_val`]}
                            onChange={(e) =>
                              setPartnershipSettings({
                                ...partnershipSettings,
                                [`p${i}_val`]: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase text-slate-500">
                            Label
                          </label>
                          <Input
                            value={(partnershipSettings as any)[`p${i}_label`]}
                            onChange={(e) =>
                              setPartnershipSettings({
                                ...partnershipSettings,
                                [`p${i}_label`]: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSavePartnership} disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Partnership Stats"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
