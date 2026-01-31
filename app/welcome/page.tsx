"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AcademicCapIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Get first name
  const firstName = user?.name?.split(" ")[0] || "User";

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Get role-based redirect
  const getRedirectPath = () => {
    const roles = user?.roles || [];
    if (roles.includes("super-admin")) return "/superadmin";
    if (roles.includes("admin")) return "/admin";
    if (roles.includes("instructor")) return "/instructor";
    return "/dashboard";
  };

  // Get role display name
  const getRoleDisplay = () => {
    const roles = user?.roles || [];
    if (roles.includes("super-admin")) return "Super Administrator";
    if (roles.includes("admin")) return "Administrator";
    if (roles.includes("instructor")) return "Instructor";
    return "Learner";
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    // Animation sequence
    setShowContent(true);
    
    const timer1 = setTimeout(() => setStage(1), 800);
    const timer2 = setTimeout(() => setStage(2), 1600);
    const timer3 = setTimeout(() => setStage(3), 2400);
    const timer4 = setTimeout(() => {
      router.push(getRedirectPath());
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pln-dark to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pln-light border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pln-dark to-slate-900 flex items-center justify-center overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-pln-primary/30 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pln-light/20 rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: typeof window !== "undefined" ? window.innerHeight + 20 : 820,
            }}
            animate={{
              y: -20,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        <AnimatePresence mode="wait">
          {showContent && (
            <>
              {/* Logo Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-8"
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pln-primary to-pln-light rounded-3xl flex items-center justify-center shadow-2xl shadow-pln-primary/30">
                  <AcademicCapIcon className="w-14 h-14 text-white" />
                </div>
              </motion.div>

              {/* Greeting */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <span className="text-pln-light text-lg font-medium">
                  {getGreeting()} 👋
                </span>
              </motion.div>

              {/* User Name */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-5xl md:text-7xl font-bold text-white mb-4"
              >
                {firstName}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-pln-light"
                >
                  !
                </motion.span>
              </motion.h1>

              {/* Role Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-12"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm">
                  <SparklesIcon className="w-4 h-4 text-pln-light" />
                  {getRoleDisplay()}
                </span>
              </motion.div>

              {/* Progress Steps */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center gap-6 mb-12"
              >
                {[
                  { text: "Autentikasi", delay: 0 },
                  { text: "Memuat Data", delay: 1 },
                  { text: "Menyiapkan Dashboard", delay: 2 },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: stage >= index ? 1 : 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: stage >= index ? 1 : 0 }}
                      transition={{ type: "spring", delay: step.delay * 0.8 }}
                    >
                      <CheckCircleIcon
                        className={`w-5 h-5 ${
                          stage >= index ? "text-green-400" : "text-white/30"
                        }`}
                      />
                    </motion.div>
                    <span
                      className={`text-sm ${
                        stage >= index ? "text-white" : "text-white/30"
                      }`}
                    >
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Loading Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-pln-light rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                
                {stage >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-pln-light"
                  >
                    <RocketLaunchIcon className="w-5 h-5" />
                    <span className="text-sm">Mengarahkan ke dashboard...</span>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <p className="text-white/30 text-sm">
          PLN IP Learning Hub
        </p>
      </motion.div>
    </div>
  );
}
