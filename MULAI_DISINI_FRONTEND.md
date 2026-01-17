# 🎨 Frontend Next.js - Mulai Disini (Gemini)

**Folder:** `c:\laragon\www\plnip-portal-frontend\`
**Tech:** Next.js 16.1.3 + TypeScript + Tailwind CSS
**Deadline:** 3 Hari (20 Januari 2026)

---

## ⚡ KAMU ADA DI FOLDER FRONTEND!

Folder ini berisi **tampilan user** (UI/UX) untuk PLN IP Learning Hub.

**Backend ada di folder terpisah:**
- Backend: `c:\laragon\www\plnip-portal\` (Laravel + Oracle DB)
- Frontend: `c:\laragon\www\plnip-portal-frontend\` (Next.js - KAMU DISINI!)

---

## 📁 Struktur Folder Frontend

```
c:\laragon\www\plnip-portal-frontend\
├── app\                          # Next.js 16 App Router
│   ├── page.tsx                  # Landing page (SUDAH JADI ✅)
│   ├── login\page.tsx            # Login page (SUDAH JADI ✅)
│   ├── dashboard\page.tsx        # Dashboard employee (SUDAH JADI ✅)
│   ├── layout.tsx                # Root layout dengan AuthProvider
│   └── globals.css               # Global styles
│
├── contexts\
│   └── AuthContext.tsx           # Auth state + role redirect (SUDAH JADI ✅)
│
├── lib\
│   └── axios.ts                  # API client (SUDAH JADI ✅)
│
├── middleware.ts                 # Route protection (SUDAH JADI ✅)
├── tailwind.config.ts            # Warna PLN (SUDAH JADI ✅)
├── .env.local                    # API URL config
└── package.json                  # Dependencies
```

---

## ✅ Yang Sudah Jadi (Jangan Diubah!)

1. **Landing Page** (`app/page.tsx`)
   - Hero section dengan branding PLN
   - Features cards
   - Leadership section
   - Footer

2. **Login Page** (`app/login/page.tsx`)
   - Two-column layout
   - Form login
   - Role-based redirect (admin→Filament, employee→dashboard)

3. **Employee Dashboard** (`app/dashboard/page.tsx`)
   - Stats cards (dummy data)
   - Announcements dari API
   - Quick actions

4. **Auth System**
   - `contexts/AuthContext.tsx` - Login/logout logic
   - `lib/axios.ts` - API calls dengan Bearer token
   - `middleware.ts` - Protect routes

5. **Tailwind Config**
   - Warna PLN sudah dikonfigurasi:
     - `bg-pln-primary` (#035B71)
     - `bg-pln-light` (#00A2B9)
     - `text-pln-dark` (#024656)

---

## 🎯 TODO Frontend (Part 2 - 3 Hari!)

### Yang Harus Dibuat:

**1. Halaman Katalog Kursus** (`app/courses/page.tsx`)
- Grid layout 3 kolom (desktop), responsive
- Card kursus: thumbnail, judul, kategori, difficulty, duration
- Filter: kategori dropdown, difficulty dropdown
- Search bar (real-time search)
- Skeleton loader saat loading
- Empty state kalau no courses

**2. Halaman Detail Kursus** (`app/courses/[id]/page.tsx`)
- Hero dengan thumbnail kursus
- Info: judul, kategori, instructor, difficulty, duration
- Description (rich text formatted)
- Syllabus (list lessons)
- CTA Button: "Enroll" / "Lanjutkan Belajar"
- Breadcrumb navigation

**3. Halaman Pembelajaran Saya** (`app/my-learning/page.tsx`)
- List kursus yang sudah di-enroll
- Progress bar per kursus (%)
- Filter: In Progress / Completed
- Stats cards: Total enrolled, Completed, In Progress
- Continue button

**4. Components yang Dibutuhkan:**
- `components/CourseCard.tsx` - Card untuk katalog
- `components/CategoryFilter.tsx` - Dropdown filter kategori
- `components/SearchBar.tsx` - Search input dengan debounce
- `components/ProgressBar.tsx` - Progress bar circular/linear
- `components/LoadingSpinner.tsx` - Loading state

---

## 🔌 API Backend (Sudah Siap!)

**Base URL:** `http://127.0.0.1:8000/api`

**Endpoints yang bisa dipakai:**

```typescript
// Courses
GET  /courses                    // List semua kursus
GET  /courses?category=X         // Filter by kategori
GET  /courses?search=keyword     // Search
GET  /courses/{id}               // Detail kursus

// Enrollment
POST /courses/{id}/enroll        // Enroll ke kursus
GET  /my-courses                 // Kursus user (enrolled)

// Categories
GET  /categories                 // List kategori
```

**Cara pakai di Next.js:**
```typescript
import api from '@/lib/axios';

// Fetch courses
const response = await api.get('/courses');
const courses = response.data.data.courses;

// Enroll
await api.post(`/courses/${courseId}/enroll`);
```

---

## 🎨 Design Guidelines

**Warna PLN (Pakai Ini!):**
```tsx
// Primary actions
className="bg-pln-primary hover:bg-pln-dark text-white"

// Badges
className="bg-pln-light text-white text-xs px-2 py-1 rounded"

// Borders
className="border-pln-primary"

// Text
className="text-pln-primary font-semibold"
```

**Spacing & Layout:**
```tsx
// Container
className="max-w-6xl mx-auto px-6"

// Grid catalog
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Card
className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
```

**Responsive:**
```tsx
// Mobile first, lalu tablet, desktop
className="text-base md:text-lg lg:text-xl"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 🚀 Cara Kerja

**1. Start Dev Server:**
```bash
cd c:\laragon\www\plnip-portal-frontend
npm run dev
```
Buka: http://localhost:3000

**2. Backend Harus Jalan:**
Backend Laravel harus running di port 8000.
Kalau backend mati, API calls akan error.

**3. Test dengan User:**
- Login: employee@plnip.local / Employee123!
- Lihat dashboard
- Coba fitur baru yang kamu buat

---

## 📝 Contoh: Bikin Halaman Katalog

**File:** `app/courses/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data.courses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Katalog Kursus
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {course.description}
              </p>
              <button className="mt-4 bg-pln-primary text-white px-4 py-2 rounded-lg">
                Lihat Detail
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🐛 Troubleshooting

**API calls failed:**
- Cek backend running: http://127.0.0.1:8000
- Cek .env.local ada `NEXT_PUBLIC_API_URL`
- Cek CORS di backend: `config/cors.php` allow localhost:3000

**Hot reload tidak jalan:**
```bash
# Restart dev server
Ctrl+C
npm run dev
```

**Module not found:**
```bash
npm install
```

---

## ✅ Checklist Sebelum Submit

- [ ] Mobile responsive (test di browser mobile view)
- [ ] Loading state ada (no blank screen)
- [ ] Error handling ada (tampilkan pesan user-friendly)
- [ ] Warna PLN dipakai konsisten
- [ ] Navigasi jelas (breadcrumb, back button)
- [ ] No console errors
- [ ] API calls works (test dengan employee login)

---

## 📞 Kalau Butuh Info Backend

Backend ada di folder: `c:\laragon\www\plnip-portal\`

**Tanya user:**
- "Apakah backend endpoint /courses sudah ready?"
- "Data apa aja yang dikembalikan API?"
- "Field apa aja yang ada di course object?"

**JANGAN assume endpoint ada - always verify!**

---

## 🎯 Fokus Quality!

- ✅ Code clean & readable
- ✅ Component reusable
- ✅ TypeScript types jelas
- ✅ UI konsisten dengan design PLN
- ✅ UX smooth (loading, transitions)
- ✅ Mobile friendly

**Hasil harus MEMUASKAN! No shortcuts!** 💪

---

**Butuh konteks lengkap proyek?**
Baca: `HANDOFF_GEMINI.md` di folder ini.

**Siap coding? Let's go!** 🚀
