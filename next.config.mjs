/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Cegah halaman di-embed di iframe (anti-clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Cegah browser menebak tipe file (anti MIME sniffing)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Paksa HTTPS (hanya aktif di production dengan HTTPS)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Kontrol info referrer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Matikan fitur browser yang tidak dipakai
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Basic XSS protection
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },

  // Kompres output untuk performa lebih baik
  compress: true,

  // Hilangkan X-Powered-By header (jangan bocorkan tech stack)
  poweredByHeader: false,
};

export default nextConfig;
