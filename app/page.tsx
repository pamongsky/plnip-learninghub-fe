"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Outfit } from "next/font/google";
import {
  AcademicCapIcon,
  SparklesIcon,
  BookOpenIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlayCircleIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { url } from "inspector";

const outfit = Outfit({ subsets: ["latin"] });

// Hero background images - ganti dengan URL gambar PLN yang sesuai
const heroImages = [
  {
    url: "https://cdn.medcom.id/dynamic/content/2021/02/03/1238953/nTC6iylXh2.jpg?w=1024",
    title: "Pembangkit Listrik",
  },
  {
    url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200",
    title: "Energi Terbarukan",
  },
  {
    url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200",
    title: "Solar Panel",
  },
  {
    url: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1200",
    title: "Wind Turbine",
  },
  {
    url: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=1200",
    title: "Control Room",
  },
];

// Fallback data untuk Leaders
const defaultLeaders = [
  { id: 1, name: "Edi Srimulyanti", title: "Dir. Retail", image_path: null },
  { id: 2, name: "Adi Lumakso", title: "Dir. Pembangkitan", image_path: null },
  {
    id: 3,
    name: "Darmawan Prasodjo",
    title: "Direktur Utama",
    image_path: null,
  },
  {
    id: 4,
    name: "Yusuf Didi Setiarto",
    title: "Dir. Legal & HC",
    image_path: null,
  },
  { id: 5, name: "Edi Srimulyanti", title: "Dir. Retail", image_path: null },
  { id: 6, name: "Adi Lumakso", title: "Dir. Pembangkitan", image_path: null },
];

// Fallback data untuk Partners
const defaultPartners = [
  {
    id: 1,
    name: "Kementerian ESDM",
    logo_path: null,
    color: "bg-red-600",
    abbrev: "ESDM",
  },
  {
    id: 2,
    name: "Kementerian BUMN",
    logo_path: null,
    color: "bg-red-700",
    abbrev: "BUMN",
  },
  {
    id: 3,
    name: "PLN Indonesia Power",
    logo_path: null,
    color: "bg-teal-500",
    abbrev: "IP",
  },
  {
    id: 4,
    name: "PLN Nusantara Power",
    logo_path: null,
    color: "bg-blue-700",
    abbrev: "NP",
  },
  {
    id: 5,
    name: "Institut Teknologi Bandung",
    logo_path: null,
    color: "bg-teal-600",
    abbrev: "ITB",
  },
  {
    id: 6,
    name: "Universitas Indonesia",
    logo_path: null,
    color: "bg-yellow-500",
    abbrev: "UI",
  },
  {
    id: 7,
    name: "Oracle",
    logo_path: null,
    color: "bg-red-600",
    abbrev: "Oracle",
  },
];

const features = [
  {
    title: "Digital Learning",
    desc: "Ribuan modul teknis dan non-teknis yang bisa diakses kapan saja, di mana saja.",
    icon: BookOpenIcon,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Sertifikasi",
    desc: "Uji kompetensi terstandarisasi untuk jenjang karir yang jelas dan terukur.",
    icon: AcademicCapIcon,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "AI Mentor",
    desc: "Pendamping belajar berbasis AI untuk pertanyaan teknis dan rekomendasi karir.",
    icon: SparklesIcon,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Progress Tracking",
    desc: "Pantau perkembangan belajar Anda dengan dashboard yang intuitif.",
    icon: ChartBarIcon,
    color: "from-amber-500 to-orange-500",
  },
];

const stats = [
  { value: "50K+", label: "Talenta Aktif", icon: UserGroupIcon },
  { value: "1.2K", label: "Modul Pembelajaran", icon: BookOpenIcon },
  { value: "240+", label: "Mentor Ahli", icon: AcademicCapIcon },
  { value: "350+", label: "Sertifikasi", icon: ChartBarIcon },
];

// Counter animation component
function AnimatedCounter({ value }: { value: string | number }) {
  const stringValue = String(value);
  const numericPart = stringValue.replace(/[^0-9.]/g, "");
  const suffix = stringValue.replace(/[0-9.]/g, "");
  const [count, setCount] = useState(0);
  const target = parseFloat(numericPart) || 0;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {target >= 1000 ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  );
}

// Navigation links data
const navLinks = [
  { href: "#features", label: "Home" },
  { href: "https://www.plnindonesiapower.co.id/", label: "Company Profile" },
  { href: "#management", label: "Manajemen" },
  { href: "#ai", label: "AI Mentor" },
  { href: "#partners", label: "Partner" },
];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [cmsData, setCmsData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/landing-page");
        // Flatten settings into root level for easier access
        const data = response.data;
        setCmsData({
          ...data.settings, // Spread all settings into root
          hero_images: data.hero_images,
          leaders: data.leaders,
          partners: data.partners,
        });
      } catch (error) {
        console.error("Failed to fetch CMS data", error);
      }
    };
    fetchData();
  }, []);

  const heroItems =
    cmsData?.hero_images?.length > 0
      ? cmsData.hero_images.map((img: any) => ({
          url: img.image_path,
          title: img.title,
        }))
      : heroImages;

  const logoUrl = cmsData?.app_logo || "/images/pln-logo.png";
  const appName = cmsData?.app_name || "PLN Learning Hub";
  const heroTitle =
    cmsData?.hero_title || "Menggerakkan Talenta Energi Masa Depan";
  const heroSubtitle =
    cmsData?.hero_description ||
    "Platform learning terintegrasi untuk memperkuat kompetensi, sertifikasi, dan inovasi di lingkungan PLN Indonesia Power.";

  const features = [
    {
      title: cmsData?.f1_title || "Digital Learning",
      desc:
        cmsData?.f1_desc ||
        "Ribuan modul teknis dan non-teknis yang bisa diakses kapan saja, di mana saja.",
      icon: BookOpenIcon,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: cmsData?.f2_title || "Sertifikasi",
      desc:
        cmsData?.f2_desc ||
        "Uji kompetensi terstandarisasi untuk jenjang karir yang jelas dan terukur.",
      icon: AcademicCapIcon,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: cmsData?.f3_title || "AI Mentor",
      desc:
        cmsData?.f3_desc ||
        "Pendamping belajar berbasis AI untuk pertanyaan teknis dan rekomendasi karir.",
      icon: SparklesIcon,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: cmsData?.f4_title || "Progress Tracking",
      desc:
        cmsData?.f4_desc ||
        "Pantau perkembangan belajar Anda dengan dashboard yang intuitif.",
      icon: ChartBarIcon,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const stats = [
    {
      value: cmsData?.s1_val || "50K+",
      label: cmsData?.s1_label || "Talenta Aktif",
      icon: UserGroupIcon,
    },
    {
      value: cmsData?.s2_val || "1K",
      label: cmsData?.s2_label || "Modul Pembelajaran",
      icon: BookOpenIcon,
    },
    {
      value: cmsData?.s3_val || "240+",
      label: cmsData?.s3_label || "Mentor Ahli",
      icon: AcademicCapIcon,
    },
    {
      value: cmsData?.s4_val || "350+",
      label: cmsData?.s4_label || "Sertifikasi",
      icon: ChartBarIcon,
    },
  ];

  const rawLeaders =
    cmsData?.leaders?.length > 0 ? cmsData.leaders : defaultLeaders;
  const rawPartners =
    cmsData?.partners?.length > 0 ? cmsData.partners : defaultPartners;

  // Ensure minimum items for smooth marquee animation (at least 6 items)
  const ensureMinimumItems = (items: any[], minCount: number = 6) => {
    if (items.length >= minCount) return items;
    const multiplier = Math.ceil(minCount / items.length);
    const result = [];
    for (let i = 0; i < multiplier; i++) {
      result.push(
        ...items.map((item, idx) => ({ ...item, _dupKey: `${i}-${idx}` })),
      );
    }
    return result;
  };

  const leaders = ensureMinimumItems(rawLeaders, 6);
  const partners = ensureMinimumItems(rawPartners, 6);

  // Detect scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Detect active section
      const sections = navLinks.map((link) => link.href.replace("#", ""));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto slide setiap 10 detik - selalu aktif
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000); // 10 detik

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-900 ${outfit.className}`}
    >
      {/* Floating Pill Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className={`flex w-full max-w-5xl items-center justify-between rounded-full px-4 transition-all duration-500 ${
            scrolled
              ? "bg-white/95 py-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
              : "bg-white/10 py-3 backdrop-blur-md border border-white/20"
          }`}
        >
          {/* Logo - Left */}
          <motion.div
            className="flex items-center gap-2 pl-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {logoUrl ? (
              <div className="h-10 w-10 relative">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                  scrolled
                    ? "bg-gradient-to-br from-pln-primary to-pln-light text-white"
                    : "bg-white/20 text-white"
                }`}
              >
                <span className="text-xs font-bold">PLN</span>
              </div>
            )}
            <span
              className={`text-base font-semibold transition-all duration-300 ${
                scrolled ? "text-slate-900" : "text-white"
              }`}
            >
              {appName}
            </span>
          </motion.div>

          {/* Navigation - Center/Right */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative px-4 py-2"
              >
                <span
                  className={`text-sm font-medium transition-all duration-300 ${
                    scrolled
                      ? activeSection ===
                        (link.href?.startsWith("#")
                          ? link.href.replace("#", "")
                          : "")
                        ? "text-pln-primary"
                        : "text-slate-600 group-hover:text-slate-900"
                      : activeSection ===
                          (link.href?.startsWith("#")
                            ? link.href.replace("#", "")
                            : "")
                        ? "text-white"
                        : "text-white/70 group-hover:text-white"
                  }`}
                >
                  {link.label}
                </span>
                {/* Animated dot indicator */}
                <motion.span
                  className={`absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-300 ${
                    scrolled ? "bg-pln-primary" : "bg-white"
                  }`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale:
                      activeSection ===
                      (link.href?.startsWith("#")
                        ? link.href.replace("#", "")
                        : "")
                        ? 1
                        : 0,
                    opacity:
                      activeSection ===
                      (link.href?.startsWith("#")
                        ? link.href.replace("#", "")
                        : "")
                        ? 1
                        : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </a>
            ))}
          </div>

          {/* CTA Button - Right */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 sm:block ${
                scrolled
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  scrolled
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-white text-slate-900 hover:bg-white/90"
                }`}
              >
                Mulai Belajar
              </Link>
            </motion.div>
          </div>
        </motion.nav>
      </div>

      {/* Hero Section with Image Carousel */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 pt-16">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${heroItems[currentImageIndex]?.url}')`,
              }}
            />
          </AnimatePresence>
          {/* Overlay ringan agar gambar terlihat jelas */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-pln-light/20 blur-[150px]" />
          <div className="absolute -bottom-32 left-0 h-[400px] w-[400px] rounded-full bg-pln-primary/20 blur-[120px]" />
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "w-8 bg-pln-light"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex w-[min(1200px,92%)] flex-col gap-12 py-20 lg:flex-row lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-pln-light/30 bg-pln-light/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-pln-light"
            >
              <span className="h-2 w-2 rounded-full bg-pln-light animate-pulse" />
              PLN Indonesia Power
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-6 text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-lg text-white/70 leading-relaxed"
            >
              {heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/login"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-pln-light to-cyan-400 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-pln-light/30 transition hover:shadow-2xl hover:shadow-pln-light/40 hover:-translate-y-1"
              >
                <PlayCircleIcon className="h-5 w-5 transition group-hover:scale-110" />
                Mulai Belajar
              </Link>
              <a
                href="#features"
                className="rounded-full border border-white/30 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/50"
              >
                Pelajari Lebih Lanjut
              </a>
            </motion.div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Learning Impact</span>
                <span className="rounded-full bg-pln-light/20 px-3 py-1 text-xs font-semibold text-pln-light">
                  2026
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="group rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <stat.icon className="h-5 w-5 text-pln-light/60" />
                    <p className="mt-3 text-3xl font-bold text-white">
                      <AnimatedCounter value={stat.value} />
                    </p>
                    <p className="mt-1 text-xs text-white/50">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.05),transparent_50%)]" />
        <div className="mx-auto w-[min(1200px,92%)]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-pln-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-pln-primary">
              Fitur Unggulan
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Semua yang Anda Butuhkan
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              Platform lengkap untuk mendukung perjalanan pembelajaran dan
              pengembangan karir Anda
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50 transition-shadow hover:shadow-xl"
              >
                <div
                  className={`inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-4 text-white shadow-lg`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="relative overflow-hidden bg-gradient-to-br from-pln-primary to-pln-dark py-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent_50%)] opacity-50" />
        <div className="mx-auto w-[min(1200px,92%)]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Dampak Pembelajaran Kami
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Angka-angka yang menunjukkan komitmen kami dalam pengembangan SDM
              PLN
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <stat.icon className="h-8 w-8 text-pln-light" />
                </div>
                <p className="text-5xl font-bold text-white">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="mt-2 text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Management Section */}
      <section id="management" className="bg-white py-24">
        <div className="mx-auto w-[min(1200px,92%)] text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-pln-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-pln-primary">
              Leadership
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Struktur Pimpinan
            </h2>
            <p className="mt-4 text-slate-500">
              Komitmen pimpinan dalam pengembangan human capital PLN
            </p>
          </motion.div>
        </div>
        <div
          className="mt-12 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="marquee-track flex gap-6">
            {leaders.map((leader: any, index: number) => (
              <div
                key={`leader-1-${leader._dupKey || leader.id || index}`}
                className="flex w-64 flex-shrink-0 flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg shadow-slate-200/50 transition hover:shadow-xl hover:border-pln-light/50"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full overflow-hidden bg-slate-100 shadow-lg shadow-pln-primary/30">
                  {leader.image_path ? (
                    <img
                      src={leader.image_path}
                      alt={leader.name}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pln-primary to-pln-light text-2xl font-bold text-white">
                      {leader.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {leader.name}
                </h3>
                <p className="text-sm text-pln-primary">{leader.title}</p>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {leaders.map((leader: any, index: number) => (
              <div
                key={`leader-2-${leader._dupKey || leader.id || index}`}
                className="flex w-64 flex-shrink-0 flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg shadow-slate-200/50 transition hover:shadow-xl hover:border-pln-light/50"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full overflow-hidden bg-slate-100 shadow-lg shadow-pln-primary/30">
                  {leader.image_path ? (
                    <img
                      src={leader.image_path}
                      alt={leader.name}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pln-primary to-pln-light text-2xl font-bold text-white">
                      {leader.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)} 
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {leader.name}
                </h3>
                <p className="text-sm text-pln-primary">{leader.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section
        id="ai"
        className="relative overflow-hidden bg-slate-950 py-24 text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute -right-32 top-10 h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[150px]" />
        <div className="absolute -left-32 bottom-10 h-[300px] w-[300px] rounded-full bg-pln-light/20 blur-[120px]" />

        <div className="relative mx-auto flex w-[min(1200px,92%)] flex-col items-center gap-12 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
              <SparklesIcon className="h-4 w-4" />
              Powered by AI
            </span>
            <h2 className="mt-6 text-3xl font-bold md:text-4xl">
              Asisten Belajar{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pribadi
              </span>
            </h2>
            <p className="mt-4 text-lg text-white/60 leading-relaxed">
              Tanyakan materi teknis, dapatkan ringkasan modul, dan rekomendasi
              karir secara instan dengan AI mentor yang selalu siap membantu.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-purple-500/30 transition hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1"
            >
              <SparklesIcon className="h-5 w-5" />
              Coba AI Mentor
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white/10 p-4 text-sm">
                    Halo! Saya AI Mentor PLN. Ada yang bisa saya bantu tentang
                    materi pembelajaran hari ini?
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-end"
                >
                  <div className="rounded-2xl rounded-tr-none bg-gradient-to-r from-pln-primary to-pln-light p-4 text-sm">
                    Jelaskan fungsi Gardu Induk dalam sistem transmisi.
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white/10 p-4 text-sm">
                    Gardu Induk berfungsi sebagai titik transformasi tegangan
                    dalam sistem transmisi...
                    <span className="inline-block h-4 w-1 animate-pulse bg-purple-400 ml-1" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section - Clean & Simple */}
      <section
        id="partners"
        className="relative overflow-hidden bg-white py-24"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,156,222,0.03),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,156,222,0.03),transparent_40%)]" />

        <div className="relative mx-auto w-[min(1200px,92%)] text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Trusted Partners
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Dipercaya oleh <span className="text-pln-primary">100+</span>{" "}
              Institusi
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              Bekerja sama dengan kementerian, BUMN, universitas, dan perusahaan
              teknologi terkemuka
            </p>
          </motion.div>
        </div>

        {/* Partner Logos - Single Row */}
        <div className="mt-16">
          <div
            className="overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)",
            }}
          >
            <div className="marquee-track-slow flex gap-8 py-4">
              {partners.map((partner: any, index: number) => (
                <div
                  key={`p1-${partner._dupKey || index}`}
                  className="flex flex-col min-w-[180px] items-center justify-center p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
                >
                  {partner.logo_path ? (
                    <img
                      src={partner.logo_path}
                      alt={partner.name}
                      className="h-20 w-full object-contain"
                    />
                  ) : (
                    <div
                      className={`h-20 w-full rounded-xl ${partner.color || "bg-slate-400"} flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-xl">
                        {partner.abbrev || partner.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-600 text-center font-medium">
                    {partner.name}
                  </p>
                </div>
              ))}
              {partners.map((partner: any, index: number) => (
                <div
                  key={`p2-${partner._dupKey || index}`}
                  className="flex flex-col min-w-[180px] items-center justify-center p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
                >
                  {partner.logo_path ? (
                    <img
                      src={partner.logo_path}
                      alt={partner.name}
                      className="h-20 w-full object-contain"
                    />
                  ) : (
                    <div
                      className={`h-20 w-full rounded-xl ${partner.color || "bg-slate-400"} flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-xl">
                        {partner.abbrev || partner.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-600 text-center font-medium">
                    {partner.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Stats below partners with animated counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-16 flex w-[min(900px,92%)] flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          <motion.div className="text-center px-6" whileHover={{ scale: 1.05 }}>
            <p className="text-4xl font-bold text-slate-900">
              <AnimatedCounter value={parseInt(cmsData?.p1_val || "100")} />+
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {cmsData?.p1_label || "Partner Institusi"}
            </p>
          </motion.div>
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden md:block" />
          <motion.div className="text-center px-6" whileHover={{ scale: 1.05 }}>
            <p className="text-4xl font-bold text-slate-900">
              <AnimatedCounter value={parseInt(cmsData?.p2_val || "50")} />+
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {cmsData?.p2_label || "Kementerian & BUMN"}
            </p>
          </motion.div>
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden md:block" />
          <motion.div className="text-center px-6" whileHover={{ scale: 1.05 }}>
            <p className="text-4xl font-bold text-slate-900">
              <AnimatedCounter value={parseInt(cmsData?.p3_val || "30")} />+
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {cmsData?.p3_label || "Universitas"}
            </p>
          </motion.div>
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden md:block" />
          <motion.div className="text-center px-6" whileHover={{ scale: 1.05 }}>
            <p className="text-4xl font-bold text-slate-900">
              <AnimatedCounter value={parseInt(cmsData?.p4_val || "20")} />+
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {cmsData?.p4_label || "Tech Partners"}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pln-primary via-pln-dark to-slate-900 py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.15),transparent_50%)]" />

        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto w-[min(900px,92%)] text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm border border-white/20"
            >
              <SparklesIcon className="h-4 w-4" />
              Platform Pembelajaran Terdepan
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white md:text-5xl lg:text-6xl leading-tight"
            >
              Siap Memulai Perjalanan
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Belajar Anda?
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-relaxed"
            >
              Bergabunglah dengan ribuan talenta PLN yang telah mengembangkan
              kompetensi mereka melalui platform pembelajaran terintegrasi kami.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-pln-primary shadow-2xl transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 hover:scale-105"
              >
                <AcademicCapIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                Mulai Sekarang
                <motion.span
                  className="absolute -right-1 -top-1 flex h-3 w-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
                </motion.span>
              </Link>

              <button
                onClick={() => {
                  document.querySelector("#features")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="group inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/50 hover:-translate-y-1"
              >
                <BookOpenIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                Pelajari Fitur
              </button>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-white/60 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>
                  {cmsData?.s1_val || "50K+"}+{" "}
                  {cmsData?.s1_label || "Talenta Aktif"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <span>
                  {cmsData?.s2_val || "1K"}+{" "}
                  {cmsData?.s2_label || "Modul Pembelajaran"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span>
                  {cmsData?.s3_val || "240+"}+{" "}
                  {cmsData?.s3_label || "Mentor Ahli"}
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-slate-950 to-slate-900 py-16 text-slate-400 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(14,165,233,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.03),transparent_50%)]"></div>

        <div className="mx-auto w-[min(1200px,92%)] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-12 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Company Info */}
            <div className="lg:col-span-2">
              <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {cmsData?.app_logo ? (
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pln-primary/50 to-pln-light/50 rounded-3xl blur-3xl opacity-60"></div>
                    <img
                      src={cmsData.app_logo}
                      alt={cmsData.app_name || "PLN Logo"}
                      className="relative h-40 w-40 object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pln-primary to-pln-light rounded-3xl blur-3xl opacity-60"></div>
                    <div className="relative flex h-40 w-40 items-center justify-center">
                      <span className="text-6xl font-bold text-white drop-shadow-2xl">
                        PLN
                      </span>
                    </div>
                  </motion.div>
                )}

                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {cmsData?.app_name || "PLN Learning Hub"}
                  </h3>
                  <p className="text-base text-pln-light font-medium mt-1">
                    {cmsData?.company_name || "PT PLN Indonesia Power"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {cmsData?.company_tagline ||
                      "Menggerakkan Talenta Energi Masa Depan"}
                  </p>
                </div>
              </motion.div>
              <motion.p
                className="text-sm leading-relaxed max-w-md"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {cmsData?.company_description ||
                  "Platform pembelajaran terintegrasi untuk pengembangan kompetensi SDM PLN Indonesia Power."}
              </motion.p>
            </div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-white font-semibold mb-4">Tautan Cepat</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    className="transition hover:text-pln-light hover:translate-x-1 inline-block"
                  >
                    Fitur
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.plnindonesiapower.co.id/"
                    className="transition hover:text-pln-light hover:translate-x-1 inline-block"
                  >
                    Company Profile
                  </a>
                </li>
                <li>
                  <a
                    href="#management"
                    className="transition hover:text-pln-light hover:translate-x-1 inline-block"
                  >
                    Manajemen
                  </a>
                </li>
                <li>
                  <a
                    href="#partners"
                    className="transition hover:text-pln-light hover:translate-x-1 inline-block"
                  >
                    Partner
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-white font-semibold mb-4">Hubungi Kami</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-pln-light mt-0.5">📧</span>
                  <a
                    href={`mailto:${cmsData?.company_email || "info@plnip.co.id"}`}
                    className="hover:text-white transition"
                  >
                    {cmsData?.company_email || "info@plnip.co.id"}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pln-light mt-0.5">📞</span>
                  <a
                    href={`tel:${cmsData?.company_phone || "+62 21 7251234"}`}
                    className="hover:text-white transition"
                  >
                    {cmsData?.company_phone || "+62 21 7251234"}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pln-light mt-0.5">📍</span>
                  <span className="flex-1">
                    {cmsData?.company_address || "Jakarta, Indonesia"}
                  </span>
                </li>
              </ul>

              {/* Social Media */}
              <div className="mt-6">
                <h5 className="text-white font-semibold mb-3 text-sm">
                  Ikuti Kami
                </h5>
                <div className="flex gap-3">
                  <a
                    href={`https://instagram.com/${(cmsData?.social_instagram || "@plnip_official").replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-pln-light hover:scale-110"
                    title="Instagram"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href={`https://linkedin.com/company/${cmsData?.social_linkedin || "PLN-Indonesia-Power"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-pln-light hover:scale-110"
                    title="LinkedIn"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href={`https://youtube.com/@${cmsData?.social_youtube || "PLNIndonesiaPower"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-pln-light hover:scale-110"
                    title="YouTube"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a
                    href={`https://tiktok.com/@${cmsData?.social_tiktok || "plnip"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-pln-light hover:scale-110"
                    title="TikTok"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()}{" "}
              {cmsData?.company_name || "PT PLN Indonesia Power"}. All rights
              reserved.
            </p>
            <div className="flex gap-6 text-xs">
              <a href="#" className="hover:text-white transition">
                Kebijakan Privasi
              </a>
              <a href="#" className="hover:text-white transition">
                Syarat & Ketentuan
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
