import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import AIChatWidget from "@/components/AIChatWidget";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#009CDE",
};

export const metadata: Metadata = {
  title: "PLN IP Learning Hub",
  description: "Enterprise Learning Management System for PLN Indonesia Power",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PLN Learning",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} font-sans antialiased transition-colors duration-300`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider>
            <SettingsProvider>
              {children}
              <AIChatWidget />
              <Toaster richColors position="top-center" />
            </SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
