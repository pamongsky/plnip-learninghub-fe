"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

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
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
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
    const token = Cookies.get("auth_token");
    if (token) {
      try {
        const response = await api.get("/user");
        setUser(response.data.data.user);
      } catch (error) {
        Cookies.remove("auth_token");
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data.data;

      Cookies.set("auth_token", token, { expires: 7 }); // 7 days
      setUser(user);

      // Role-based redirect
      const roles = user.roles || [];

      if (roles.includes("super-admin")) {
        router.push("/superadmin");
        return;
      }

      if (roles.includes("admin")) {
        router.push("/admin");
        return;
      }

      if (roles.includes("instructor")) {
        router.push("/instructor");
        return;
      }

      router.push("/dashboard");
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("auth_token");
      setUser(null);
      router.push("/login");
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => {
    try {
      const response = await api.post("/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      const { token, user } = response.data.data;

      Cookies.set("auth_token", token, { expires: 7 });
      setUser(user);
      router.push("/dashboard");
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout, register }}
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
