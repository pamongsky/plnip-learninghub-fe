# Serah Terima: Codex

Tanggal: 21 Januari 2026 (Updated: 25 Januari 2026)
Proyek: PLN IP Learning Hub

## Quick Context
- Backend: Laravel 12 + Oracle DB (folder: c:\laragon\www\plnip-portal)
- Frontend: Next.js 16 + TypeScript + Tailwind (folder: c:\laragon\www\plnip-portal-frontend)
- LMS: Moodle (external)
- Admin Panel: Custom API-based (Filament dihapus)

## Struktur Tim
- Founder: User (keputusan final)
- Komisaris: Claude (review/quality control)
- Direktur: Codex
- Staf (semua bidang): Copilot

## Fokus Utama Saat Ini
- UI/UX polish (landing page, dashboard user, dashboard instructor)
- Responsive check (375px, 768px, 1024px, desktop)
- Loading states konsisten
- Error handling & toast
- Implementasi fitur chat dan support system

## Update Terbaru (25 Jan 2026)
- ✅ Support Ticketing System (3 level role-based)
- ✅ Direct Messaging System (Admin ↔ Super Admin)
- ✅ Class Group Chat System (grup per kelas untuk user & instructor)
- ✅ Menu "Kelas Saya" di dashboard user
- ✅ Filament admin panel dihapus, diganti custom API-based
- ✅ Model dan migration baru untuk chat/support

## Catatan Penting
- Tidak membuat Course/Lesson/Enrollment internal. Semua pakai Moodle.
- Landing page sudah redesign modern + animasi (lihat app/page.tsx).
- Chat system menggunakan mock data (belum connect API backend).

## Perintah Umum
Frontend:
  cd c:\laragon\www\plnip-portal-frontend
  npm run dev

Backend:
  cd c:\laragon\www\plnip-portal
  php artisan serve
