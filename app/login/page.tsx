"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AcademicCapIcon,
  BookOpenIcon,
  SparklesIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

// Background images for carousel
const backgroundImages = [
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
    title: "Modern Learning Environment",
  },
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
    title: "Collaborative Workspace",
  },
  {
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80",
    title: "Professional Development",
  },
  {
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80",
    title: "Interactive Sessions",
  },
  {
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80",
    title: "Team Excellence",
  },
];

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  // Background image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    // Redirect to welcome page for all roles
    router.replace("/welcome");
  }, [authLoading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
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
            backgroundImage: `url('${backgroundImages[currentImageIndex].url}')`,
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
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
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
              PLN IP<br />
              <span className="text-pln-light">Learning Hub</span>
            </h1>
            <p className="text-lg text-white/70">
              Empowering Growth Through Knowledge
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpenIcon, text: "Access Thousands of Courses" },
              { icon: SparklesIcon, text: "AI-Powered Learning Assistant" },
              { icon: ShieldCheckIcon, text: "Earn Verified Certificates" },
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
              <h1 className="text-xl font-bold text-slate-800">PLN IP Learning Hub</h1>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
              <p className="text-slate-500 mt-1 text-sm">
                Sign in to continue your learning journey
              </p>
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-pln-primary focus:ring-pln-primary/20"
                  />
                  <span className="text-slate-600">Remember me</span>
                </label>
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
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-pln-primary hover:text-pln-dark font-semibold"
                >
                  Register here
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                For support, contact HCIS at{" "}
                <a href="mailto:hcis@plnip.co.id" className="text-pln-primary hover:underline">
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
