"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "@/lib/axios";

interface Settings {
  appName: string;
  appLogo: string | null;
  companyName: string;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  appName: "PLN Learning Hub",
  appLogo: null,
  companyName: "PT PLN Indonesia Power",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/landing-page");
      const data = response.data?.settings;
      if (data) {
        setSettings({
          appName: data.app_name || defaultSettings.appName,
          appLogo: data.app_logo || null,
          companyName: data.company_name || defaultSettings.companyName,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, refreshSettings: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
