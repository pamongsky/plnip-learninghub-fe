"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import { getImageUrl } from "@/lib/imageUrl";
import {
  AcademicCapIcon,
  BookOpenIcon,
  SparklesIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// Type definitions
interface LoginBackground {
  image_path: string;
  title?: string;
}

interface BackgroundImage {
  url: string;
  title: string;
}


export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImage[]>([]);
  const [loginContent, setLoginContent] = useState({
    title: "PLN IP",
    subtitle: "Learning Hub",
    tagline: "Empowering Growth Through Knowledge",
    feature1: "Access Thousands of Courses",
    feature2: "AI-Powered Learning Assistant",
    feature3: "Earn Verified Certificates",
  });
  const router = useRouter();

  // Mount detection + flash message from session expiry
  useEffect(() => {
    setIsMounted(true);
    fetchLoginPageData();

    // Show flash message if redirected due to expired session
    const flash = sessionStorage.getItem("login_flash");
    if (flash) {
      setError(flash);
      sessionStorage.removeItem("login_flash");
    }
  }, []);

  // Fetch login page data from API
  const fetchLoginPageData = async () => {
    try {
      const res = await axios.get("/landing-page");
      const data = res.data;

      // Set login backgrounds if available
      if (data.login_backgrounds && data.login_backgrounds.length > 0) {
        setBackgroundImages(
          data.login_backgrounds.map((bg: LoginBackground): BackgroundImage => ({
            url: getImageUrl(bg.image_path),
            title: bg.title || "Background",
          })),
        );
      }

      // Set login content from settings
      if (data.settings) {
        setLoginContent({
          title: data.settings.login_title || "PLN IP",
          subtitle: data.settings.login_subtitle || "Learning Hub",
          tagline:
            data.settings.login_tagline ||
            "Empowering Growth Through Knowledge",
          feature1:
            data.settings.login_feature1 || "Access Thousands of Courses",
          feature2:
            data.settings.login_feature2 || "AI-Powered Learning Assistant",
          feature3:
            data.settings.login_feature3 || "Earn Verified Certificates",
        });
      }
    } catch (error) {
      // error handled silently
      // Keep default values
    }
  };

  // Background image rotation
  useEffect(() => {
    if (backgroundImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [backgroundImages]);

  // Redirect handled by AuthContext (role-based redirect)
  // No redirect here to avoid conflict

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      // Success - don't set submitting to false, we're navigating away
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
      setSubmitting(false); // Only reset on error
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: backgroundImages[currentImageIndex]
              ? `url('${backgroundImages[currentImageIndex].url}')`
              : "none",
          }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pln-primary/70 via-pln-dark/50 to-slate-900/60" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(0,156,222,0.2),transparent_40%)]" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isMounted &&
          [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl mx-4 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block text-white space-y-8 pr-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20"
            >
              <AcademicCapIcon className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold leading-tight">
              {loginContent.title}
              <br />
              <span className="text-pln-light">{loginContent.subtitle}</span>
            </h1>
            <p className="text-lg text-white/70">{loginContent.tagline}</p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpenIcon, text: loginContent.feature1 },
              { icon: SparklesIcon, text: loginContent.feature2 },
              { icon: ShieldCheckIcon, text: loginContent.feature3 },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 text-white/80"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Image Indicators */}
          <div className="flex gap-2 pt-4">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`View background ${index + 1}`}
                aria-pressed={index === currentImageIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-pln-primary to-pln-light rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">
                PLN IP Learning Hub
              </h1>
            </div>

            <div className="mb-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between"
              >
                <Link
                  href="/"
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-pln-primary/40 hover:text-pln-primary"
                >
                  <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Ke Home
                </Link>
                <span className="text-xs text-slate-400">Portal Login</span>
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Welcome Back
                </h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Sign in to continue your learning journey
                </p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary transition text-slate-800"
                  placeholder="your.email@plnip.co.id"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary transition text-slate-800 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end text-sm">
                <Link
                  href="/forgot-password"
                  className="text-pln-primary hover:text-pln-dark font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-pln-primary to-pln-light text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-pln-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                For support, contact HCIS at{" "}
                <a
                  href="mailto:hcis@plnip.co.id"
                  className="text-pln-primary hover:underline"
                >
                  hcis@plnip.co.id
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/50 text-xs">
          © 2026 PT PLN Indonesia Power. All rights reserved.
        </p>
      </div>
    </div>
  );
}
