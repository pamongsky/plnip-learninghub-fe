"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  employee_id: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  avatar: string | null;
  is_active: boolean;
  roles: string[];
  permissions: string[];
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // register: removed - users from ERP only
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      try {
        const response = await api.get("/user");
        setUser(response.data.data.user);
      } catch (error) {
        // Clear both storages on error
        sessionStorage.removeItem("auth_token");
        Cookies.remove("auth_token");
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });
      const { token, user, requires_password_change } = response.data.data;

      // Hybrid approach: Set BOTH for double-layer security
      // 1. Session cookie (auto-clear on browser close) - for middleware
      Cookies.set("auth_token", token);

      // 2. sessionStorage (auto-clear on tab close) - stricter, for client-side
      sessionStorage.setItem("auth_token", token);

      setUser(user);

      // Check if user needs to change password
      if (requires_password_change) {
        router.replace("/change-password-required");
      } else {
        // Use replace to force navigation (can't go back to login)
        router.replace("/welcome");
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || "Login failed");
      }
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      // logout error - silent fail
    } finally {
      // Clear BOTH storages
      sessionStorage.removeItem("auth_token");
      Cookies.remove("auth_token");
      setUser(null);
      router.push("/login");
    }
  };

  // Register function removed - users are managed via ERP system
  // const register = async (
  //   name: string,
  //   email: string,
  //   password: string,
  //   passwordConfirmation: string,
  // ) => {
  //   try {
  //     const response = await api.post("/register", {
  //       name,
  //       email,
  //       password,
  //       password_confirmation: passwordConfirmation,
  //     });
  //     const { token, user } = response.data.data;
  //
  //     Cookies.set("auth_token", token, { expires: 7 });
  //     setUser(user);
  //     router.push("/dashboard");
  //   } catch (error: unknown) {
  //     throw new Error(error.response?.data?.message || "Registration failed");
  //   }
  // };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
