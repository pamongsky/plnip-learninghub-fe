# Konteks Proyek

PLN IP Learning Hub adalah portal learning terintegrasi yang memakai Moodle sebagai LMS utama.
Portal ini fokus pada:
- Landing page publik
- Login dan role-based dashboard (user/instructor/admin/superadmin)
- Pengumuman dan profil pengguna
- Support ticketing system (3 level: user/instructor/admin)
- Direct messaging system (admin ↔ super admin)
- Class chat system (grup chat per kelas untuk user dan instructor)

Stack:
- Frontend: Next.js 16 + TypeScript + Tailwind
- Backend: Laravel 12 + Oracle DB

Catatan:
- Jangan membuat fitur kursus internal.
- Arahkan akses belajar ke Moodle.
- Filament admin panel telah dihapus, diganti dengan custom API-based admin panel.
- Chat system: Grup per kelas, user hanya bisa chat dengan instructor dalam kelas yang sama.
