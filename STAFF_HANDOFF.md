# STAFF_HANDOFF (Copilot)

**Update Terakhir:** 25 Januari 2026
**Diupdate oleh:** Claude (Komisaris)

---

## Pengarahan Untuk Copilot
Kamu adalah staf all-in-one. Fokus eksekusi cepat, rapi, dan konsisten dengan keputusan Founder. Jika ada perubahan scope, wajib konfirmasi dulu.

## Struktur Tim & Alur Keputusan
- Founder: User (keputusan final)
- Komisaris: Claude (review/quality)
- Direktur: Codex (koordinasi teknis)
- Staf All-in-One: Copilot (eksekusi semua bidang)

---

## UPDATE TERBARU (25 Jan 2026) - Oleh Claude

### Fitur Baru yang Sudah Dibuat

#### 1. Support Ticketing System
Sistem tiket bantuan dengan 3 level berbeda:

**User (Peserta):**
- `app/dashboard/support/page.tsx` - List tiket (UI sederhana, tanpa stats)
- `app/dashboard/support/[id]/page.tsx` - Detail tiket + reply
- `app/dashboard/support/create/page.tsx` - Buat tiket
- Kategori: Akses Kelas, Materi Pembelajaran, Sertifikat, Akun & Login, Lainnya
- Priority otomatis: medium (user tidak pilih)
- Menu "Bantuan" di sidebar user

**Instructor:**
- `app/instructor/support/page.tsx` - List tiket dengan stats dashboard (Total, Open, In Progress, Resolved)
- `app/instructor/support/[id]/page.tsx` - Detail tiket + reply
- `app/instructor/support/create/page.tsx` - Buat tiket dengan pilihan prioritas
- Kategori: Jadwal Kelas, Materi & Konten, Peserta, Teknis Platform, Sertifikasi, Koordinasi Admin
- Priority: Low / Medium / High (instructor bisa pilih)
- Menu "Bantuan" di sidebar instructor

**Admin:**
- `app/admin/support/page.tsx` - Dashboard tiket dengan filter source
- Bisa filter tiket dari: Semua / Peserta / Instruktur
- Badge menampilkan asal tiket (Peserta = biru, Instruktur = amber)
- Full management capabilities

#### 2. Direct Messaging (DM) System
Fitur pesan langsung antar role tertentu:

**Super Admin → Admin:**
- `app/superadmin/messages/page.tsx` - Sudah ada sebelumnya
- Stats: Percakapan dengan Admin, Pesan Belum Dibaca, Admin Aktif, Aktif Hari Ini
- Menggunakan komponen `DirectMessageChat`

**Admin → Super Admin:** (BARU)
- `app/admin/messages/page.tsx` - Halaman DM untuk eskalasi
- Stats: Percakapan dengan Super Admin, Pesan Belum Dibaca, Super Admin Tersedia, Respon Hari Ini
- Banner info tentang eskalasi
- Menu "Pesan ke Super Admin" di sidebar admin (`components/admin/AdminShell.tsx`)

#### 3. Class Group Chat System ✅ IMPLEMENTED
Fitur chat grup per kelas untuk interaksi antara user dan instructor:

**Instructor:**
- Tab "Chat Grup" di halaman detail kelas (`app/instructor/classes/[id]/page.tsx`)
- Badge notifikasi untuk pertanyaan yang belum dijawab
- Bisa mark question sebagai answered
- Full access ke semua pesan

**User:**
- Menu "Kelas Saya" di sidebar dashboard (`app/dashboard/classes/page.tsx`)
- List kelas yang diikuti dengan button "Chat Grup"
- Halaman chat dedicated (`app/dashboard/classes/[id]/chat/page.tsx`)
- Hanya bisa kirim discussion atau question
- Tidak bisa chat dengan user lain (hanya dengan instructor dalam grup kelas)

**Fitur Chat:**
- Discussion messages (umum)
- Question messages (dengan status answered/unanswered)
- Real-time UI updates (mock data)
- Responsive design
- Dark mode support

### Konsep Chat yang Disetujui Founder
- **User & Instructor:** TIDAK bisa DM satu sama lain
- **User & Instructor:** Hanya bisa buat Support Ticket ke Admin
- **Admin & Super Admin:** Bisa DM langsung untuk koordinasi

### Catatan Teknis
- Semua halaman baru menggunakan Framer Motion untuk animasi
- Dark mode support di semua halaman baru
- UI/UX konsisten dengan design system yang ada
- Mock data digunakan (belum connect ke API backend)

### Teknologi Live Chat (Rekomendasi untuk Production)
Untuk ratusan ribu pengguna, gunakan:

**Backend:**
- **Laravel Reverb** - WebSocket server resmi Laravel (gratis, self-hosted)
- **Redis** - Untuk horizontal scaling & session management
- **Laravel Events** - Broadcast events ke frontend

**Frontend:**
- **Laravel Echo** - WebSocket client untuk Next.js
- **Pusher JS** (atau Reverb client) - Real-time connection

**Arsitektur:**
```
Frontend (Next.js)
    ↓ WebSocket
Laravel Reverb (WebSocket Server)
    ↓ Redis Pub/Sub
Laravel Backend (API + Events)
    ↓
Database (Oracle)
```

**File Backend yang Sudah Ada:**
- `app/Events/NewDirectMessage.php` - Event untuk broadcast pesan baru
- `app/Http/Controllers/API/DirectMessageController.php` - API controller
- `app/Models/DirectMessage.php` - Model pesan
- `app/Models/Conversation.php` - Model percakapan

**Belum Diimplementasi:**
- Konfigurasi Reverb di backend
- Laravel Echo di frontend
- Connect frontend ke WebSocket

---

## Tujuan Produk & Batasan
- Portal learning PLN IP sebagai gateway + ringkasan.
- LMS utama: Moodle (external).
- JANGAN membuat Course/Lesson/Enrollment internal.

## Scope Fitur per Role

### Super Admin:
- Kelola user semua role
- Set role/permission
- Kelola company profile (logo, teks, banner)
- Kelola partner institusi
- Kelola announcement global
- Monitoring sinkronisasi Moodle (status ringkas saja)
- **DM ke Admin** ✅

### Admin:
- Kelola pengumuman unit
- Kelola user di unitnya
- Lihat laporan unit
- **Kelola Support Ticket dari User & Instructor** ✅
- **DM ke Super Admin** ✅

### Instructor:
- Lihat daftar peserta kelas
- Lihat siapa yang sudah mengerjakan tugas/ujian
- Status proses sederhana: belum mulai / sudah dikerjakan
- **Buat Support Ticket ke Admin** ✅

### User:
- Dashboard pribadi
- Lihat pengumuman
- Masuk ke Moodle
- **Buat Support Ticket ke Admin** ✅

---

## Arsitektur & Folder Penting

**Frontend:** `c:\laragon\www\plnip-portal-frontend`
**Backend:** `c:\laragon\www\plnip-portal`

### Frontend Structure:
```
app/
├── page.tsx                    # Landing page
├── login/page.tsx              # Login
├── dashboard/                  # User pages
│   ├── page.tsx               # Dashboard
│   └── support/               # Support ticket (BARU)
│       ├── page.tsx           # List
│       ├── [id]/page.tsx      # Detail
│       └── create/page.tsx    # Create
├── instructor/                 # Instructor pages
│   ├── page.tsx
│   └── support/               # Support ticket (BARU)
│       ├── page.tsx
│       ├── [id]/page.tsx
│       └── create/page.tsx
├── admin/                      # Admin pages
│   ├── page.tsx
│   ├── support/page.tsx       # Ticket management (UPDATED)
│   └── messages/page.tsx      # DM ke Super Admin (BARU)
└── superadmin/                 # Super Admin pages
    ├── page.tsx
    └── messages/page.tsx      # DM ke Admin

components/
├── chat/
│   └── DirectMessageChat.tsx  # Reusable chat component
├── admin/
│   └── AdminShell.tsx         # Admin layout (UPDATED)
├── dashboard/
│   └── DashboardShell.tsx     # User layout (UPDATED)
└── instructor/
    └── InstructorShell.tsx    # Instructor layout (UPDATED)
```

---

## Flow Utama
Landing -> Login -> Redirect sesuai role -> Dashboard -> Masuk Moodle

## Flow Support Ticket
User/Instructor -> Buat Ticket -> Admin Review -> Reply/Resolve

## Flow DM
Admin -> Pesan ke Super Admin -> Super Admin Reply (dan sebaliknya)

---

## UI/UX Direction
- Modern, clean, full-width layout
- Warna korporat PLN
- Animasi ringan (page load, reveal, marquee)
- Responsive: 375px, 768px, 1024px, desktop
- Dark mode support

---

## API Penting (Frontend)

### Auth:
- POST /api/login
- POST /api/logout
- GET /api/user

### Dashboard:
- GET /api/dashboard/employee
- GET /api/announcements
- GET /api/announcements/{id}
- GET /api/announcements/latest

### Support Ticket (Backend belum dibuat):
- GET /api/support/tickets
- POST /api/support/tickets
- GET /api/support/tickets/{id}
- POST /api/support/tickets/{id}/reply
- PATCH /api/support/tickets/{id}/status

### Direct Message (Backend belum dibuat):
- GET /api/messages/conversations
- POST /api/messages/conversations
- GET /api/messages/conversations/{id}/messages
- POST /api/messages/conversations/{id}/messages

---

## Checklist QA
- [x] Login user & instructor
- [x] Dashboard tampil sesuai role
- [x] Error handling & toast
- [x] Responsive layout di mobile/tablet/desktop
- [x] No console errors
- [x] Support ticket UI untuk User
- [x] Support ticket UI untuk Instructor
- [x] Support ticket management untuk Admin
- [x] DM Admin ke Super Admin
- [ ] Connect Support Ticket ke API backend
- [ ] Connect DM ke API backend (WebSocket/Reverb)

---

## Catatan Implementasi
- Portal tidak meniru Moodle. Hanya ringkasan + tombol masuk Moodle.
- Jangan ubah scope tanpa konfirmasi Founder.
- Semua fitur chat/support masih pakai MOCK DATA
- Untuk production dengan ratusan ribu user, gunakan Laravel Reverb + Redis

---

## Next Steps (Prioritas)
1. Backend API untuk Support Ticket
2. Backend API untuk Direct Message
3. Setup Laravel Reverb di backend (`php artisan reverb:install`)
4. Install Laravel Echo di frontend (`npm install laravel-echo pusher-js`)
5. Connect DirectMessageChat component ke WebSocket
6. Testing end-to-end

## Perintah Setup Reverb (Backend)
```bash
cd c:\laragon\www\plnip-portal
composer require laravel/reverb
php artisan reverb:install
php artisan reverb:start
```

## Perintah Setup Echo (Frontend)
```bash
cd c:\laragon\www\plnip-portal-frontend
npm install laravel-echo pusher-js
```
