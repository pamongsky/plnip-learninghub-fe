# FRONTEND CERTIFICATE IMPLEMENTATION - COMPLETE

## 🎯 Overview

Frontend lengkap untuk sistem sertifikat PLN IP Portal dengan 5 halaman utama:

1. **User Dashboard** - Lihat & download sertifikat pribadi
2. **Admin Templates** - Kelola template desain sertifikat
3. **Admin Certificates** - Monitor & revoke sertifikat
4. **Admin Course Settings** - Konfigurasi sertifikat per kelas
5. **Public Verification** - Verifikasi keaslian sertifikat

## 📂 File Structure

```
frontend/
├── lib/api/
│   ├── certificates.ts          # API client untuk certificates & templates
│   ├── courses.ts                # Updated dengan certificate fields
│   └── index.ts                  # Export semua API clients
├── app/
│   ├── dashboard/certificates/
│   │   └── page.tsx              # User: My Certificates (download, lihat detail)
│   ├── admin/
│   │   ├── certificate-templates/
│   │   │   └── page.tsx          # Admin: CRUD templates (upload PDF/JPG/PNG)
│   │   ├── certificates/
│   │   │   └── page.tsx          # Admin: Monitor certificates (revoke/restore)
│   │   └── courses/[id]/
│   │       └── page.tsx          # Admin: Edit course + certificate settings tab
│   └── verify-certificate/
│       └── page.tsx              # Public: Verify by verification code
```

## 🔧 API Client (lib/api/certificates.ts)

### Interfaces

```typescript
interface CertificateTemplate {
  id: number;
  name: string;
  category: string | null;
  file_path: string;
  preview_path: string | null;
  variables: Record<string, string>;
  settings: Record<string, any>;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
}

interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  template_id: number | null;
  certificate_number: string;
  course_name: string;
  student_name: string;
  completion_date: string;
  issue_date: string;
  final_score: number;
  grade: string;
  total_hours: number;
  instructor_name: string | null;
  certificate_url: string;
  verification_code: string;
  is_valid: boolean;
  notes: string | null;
}

interface CertificateStats {
  total: number;
  valid: number;
  revoked: number;
  this_month: number;
  by_course: Array<{
    course_id: number;
    course_name: string;
    total: number;
  }>;
}
```

### certificateTemplateApi Methods

- `getAll(params?)` - Get all templates with optional filters (category, active_only)
- `getOne(id)` - Get single template detail
- `getVariables()` - Get available placeholder variables ({{nama}}, {{kelas}}, etc.)
- `getCategories()` - Get list of categories
- `create(FormData)` - Upload new template (PDF/JPG/PNG + preview image)
- `update(id, FormData)` - Update template
- `delete(id)` - Delete template

### certificateApi Methods

**User Endpoints:**

- `getMyCertificates()` - Get my certificates
- `getOne(id)` - Get certificate detail
- `download(id)` - Download certificate PDF (returns Blob)
- `verify(verificationCode)` - Public verification by code

**Admin Endpoints:**

- `getAll(params)` - Get all certificates with filters (course_id, user_id, is_valid, search, pagination)
- `getStats()` - Get statistics (total, valid, revoked, this_month, by_course)
- `revoke(id, notes?)` - Revoke certificate
- `restore(id)` - Restore certificate

## 📄 Page Details

### 1. User Dashboard (/dashboard/certificates)

**Features:**

- Stats cards: Total, Valid, Grade A, This Year
- Certificate grid dengan card design
- Tampilkan: course name, certificate number, final score, grade, total hours, instructor, issue date
- Verification code display
- Download button (disabled jika not valid)
- Error message untuk revoked certificates

**Components Used:**

- Badge (grade colors: A=emerald, B=blue, C=amber, D=orange, E=red)
- Card, Button, motion dari framer-motion
- Icons: DocumentTextIcon, CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon

### 2. Admin Template Management (/admin/certificate-templates)

**Features:**

- Grid view template cards dengan preview image
- Badge: Default, Active/Inactive status
- Available Variables info box (13 placeholders)
- Upload dialog: template file (PDF/JPG/PNG), preview image, name, category, description, is_active, is_default
- Edit & delete actions per template

**Form Fields:**

- Name (required)
- Category (select dari existing + "new" option)
- Description (textarea, optional)
- Template file (PDF/JPG/PNG, required for create, optional for edit)
- Preview image (JPG/PNG, optional)
- Is Active checkbox
- Is Default checkbox

### 3. Admin Certificate Monitor (/admin/certificates)

**Features:**

- Stats dashboard: Total, Valid, Revoked, This Month
- Filters: Search (nomor/nama/kelas), Status (all/valid/revoked)
- Table view: certificate number, student name, course name, grade, issue date, status, actions
- Revoke dialog with notes input
- Restore action for revoked certificates

**Table Columns:**

- Nomor Sertifikat (font-mono)
- Peserta (student_name)
- Kelas (course_name)
- Nilai (final_score + grade badge)
- Tanggal Terbit (formatted id-ID)
- Status (Valid/Dicabut badge)
- Aksi (Cabut/Aktifkan button)

### 4. Course Certificate Settings (/admin/courses/[id])

**New Tab Added:** "Pengaturan Sertifikat"

**Form Fields:**

1. **Template Sertifikat** (select):
   - Dropdown dari certificateTemplateApi.getAll({ active_only: true })
   - Option "Tidak ada template"
   - Display: name + category

2. **Nilai Kelulusan** (input number):
   - Range: 0-100
   - Step: 0.01
   - Default: 70
   - Helper: "Nilai minimum untuk mendapatkan sertifikat"

3. **Kriteria Penyelesaian** (select):
   - **final_grade**: "Final Grade (Rata-rata Tertimbang)" - Menggunakan nilai akhir dari semua aktivitas
   - **specific_quiz**: "Specific Quiz (Ujian Tertentu)" - Berdasarkan nilai dari satu ujian/quiz
   - **completion_and_grade**: "Completion + Grade (Selesai & Lulus)" - Harus selesai semua materi DAN lulus nilai
   - Helper text berubah sesuai pilihan

4. **Moodle Quiz ID** (input number):
   - Hanya muncul jika criteria = specific_quiz
   - Placeholder: "Masukkan Moodle Quiz ID"
   - Helper: "ID quiz/exam di Moodle yang akan dijadikan acuan nilai sertifikat"

5. **Auto-Issue Sertifikat** (toggle switch):
   - Custom switch dengan peer styling Tailwind
   - Helper: "Otomatis terbitkan sertifikat saat lulus (via cron job)"

6. **Delay Penerbitan** (input number):
   - Range: 0-30
   - Helper: "Jumlah hari delay setelah lulus sebelum sertifikat diterbitkan (0-30 hari)"

**Save Action:**

- Calls coursesApi.update(id, certSettings)
- Shows toast success/error
- Reloads course data after save

### 5. Public Verification (/verify-certificate)

**Features:**

- Standalone page (tidak perlu login)
- Input kode verifikasi (16 char, uppercase, font-mono)
- Validation: required, maxLength 16
- Submit button disabled jika length !== 16

**Verification Result - Valid:**

- Green themed card (emerald-500 border, emerald bg)
- CheckCircleIcon large
- Display certificate details:
  - Certificate number
  - Student name (with UserIcon)
  - Course name (with AcademicCapIcon)
  - Final score + grade badge
  - Total hours
  - Instructor name
  - Completion date (formatted id-ID)
  - Issue date (formatted id-ID)
- Green verification badge with timestamp
- "Verifikasi Sertifikat Lain" button

**Verification Result - Invalid:**

- Red themed card (red-500 border, red bg)
- XCircleIcon large
- Error message
- "Verifikasi Sertifikat Lain" button

## 🎨 Design Patterns

### Color Scheme

- Primary: `bg-pln-primary` (PLN blue)
- Success: `emerald-500/600/700`
- Error: `red-500/600/700`
- Warning: `amber-500/600/700`
- Info: `blue-500/600/700`

### Grade Colors

```typescript
const getGradeBadge = (grade: string) => {
  'A': 'bg-emerald-100 text-emerald-700',
  'B': 'bg-blue-100 text-blue-700',
  'C': 'bg-amber-100 text-amber-700',
  'D': 'bg-orange-100 text-orange-700',
  'E': 'bg-red-100 text-red-700',
};
```

### Date Formatting

```typescript
new Date(date).toLocaleDateString("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
```

### File Download Pattern

```typescript
const blob = await certificateApi.download(id);
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `${certificate_number}.pdf`;
document.body.appendChild(a);
a.click();
window.URL.revokeObjectURL(url);
document.body.removeChild(a);
```

## 🔄 State Management

### Loading States

- Initial load: `setLoading(true)` during fetch
- Button states: `disabled={loading || condition}`
- Save actions: separate `savingCert` state

### Form States

```typescript
const [certSettings, setCertSettings] = useState({
  certificate_template_id: null as number | null,
  passing_grade: 70,
  certificate_criteria: "final_grade",
  certificate_quiz_id: null as number | null,
  auto_issue_certificate: true,
  certificate_issue_delay_days: 0,
});
```

### Conditional Rendering

- Show Quiz ID field only if `certificate_criteria === 'specific_quiz'`
- Disable download button if `!cert.is_valid`
- Show notes if `!cert.is_valid && cert.notes`

## 🚀 Usage Flow

### User Flow

1. User login → Dashboard → Certificates tab
2. View my certificates with stats
3. Click "Download Sertifikat" → triggers download
4. Share verification code for public verification

### Admin Template Flow

1. Admin → Certificate Templates
2. Click "Tambah Template"
3. Upload template file (PDF/JPG/PNG) + preview
4. Set name, category, description, active, default
5. Save → template available for course assignment

### Admin Course Config Flow

1. Admin → Courses → [id] → "Pengaturan Sertifikat" tab
2. Select template from dropdown
3. Set passing grade (e.g., 85 for safety class)
4. Choose criteria:
   - Safety training → completion_and_grade (must finish all + pass)
   - Theory class → final_grade (weighted average)
   - Certification → specific_quiz (target final exam)
5. If specific_quiz → input quiz ID
6. Enable/disable auto-issue
7. Set delay (e.g., 7 days for verification period)
8. Click "Simpan Pengaturan Sertifikat"

### Public Verification Flow

1. Visit /verify-certificate
2. Input 16-char verification code from certificate
3. Click "Verifikasi Sertifikat"
4. View detailed certificate info if valid
5. "Verifikasi Sertifikat Lain" to check another

## ⚙️ Backend Integration Points

### Endpoints Used

```
GET    /api/certificates                    - User: my certificates
GET    /api/certificates/{id}               - User: certificate detail
GET    /api/certificates/{id}/download      - User: download PDF
GET    /api/certificates/verify?verification_code=XXX - Public: verify

GET    /api/admin/certificates              - Admin: all certificates
GET    /api/admin/certificates/stats        - Admin: statistics
PATCH  /api/admin/certificates/{id}/revoke  - Admin: revoke
PATCH  /api/admin/certificates/{id}/restore - Admin: restore

GET    /api/certificate-templates           - Get templates
GET    /api/certificate-templates/{id}      - Get template detail
GET    /api/certificate-templates/variables - Get placeholder vars
GET    /api/certificate-templates/categories - Get categories
POST   /api/certificate-templates           - Create template
POST   /api/certificate-templates/{id}      - Update template
DELETE /api/certificate-templates/{id}      - Delete template

PUT    /api/courses/{id}                    - Update course (includes cert settings)
```

### Expected Response Formats

- Certificates: Array of Certificate objects
- Templates: Array of CertificateTemplate objects
- Download: Blob (PDF file)
- Verify: `{ valid: boolean, message: string, certificate?: Certificate }`
- Stats: CertificateStats object

## 🧪 Testing Checklist

### User Page

- [ ] Load certificates from API
- [ ] Display empty state if no certificates
- [ ] Download button works (creates PDF download)
- [ ] Download disabled for invalid certificates
- [ ] Stats cards calculate correctly
- [ ] Grade badges show correct colors
- [ ] Dates formatted in Indonesian

### Template Management

- [ ] Load templates with previews
- [ ] Upload new template with file + preview
- [ ] Edit existing template (file optional)
- [ ] Delete template (with confirmation)
- [ ] Variables info displays all 13 placeholders
- [ ] Category dropdown shows existing categories
- [ ] Active/Default badges display correctly

### Certificate Monitor

- [ ] Load all certificates with pagination
- [ ] Search filters work (nomor, nama, kelas)
- [ ] Status filter works (all/valid/revoked)
- [ ] Stats cards update correctly
- [ ] Revoke opens dialog with notes input
- [ ] Revoke action updates status
- [ ] Restore action re-activates certificate
- [ ] Table sorts and displays correctly

### Course Settings

- [ ] Load course data into form
- [ ] Template dropdown shows active templates
- [ ] Criteria select changes helper text
- [ ] Quiz ID field shows/hides based on criteria
- [ ] Auto-issue toggle works
- [ ] Delay input validates (0-30)
- [ ] Save updates course settings
- [ ] Toast messages show success/error

### Public Verification

- [ ] Input accepts 16 chars only
- [ ] Submit disabled if not 16 chars
- [ ] Valid code shows green success card
- [ ] Invalid code shows red error card
- [ ] Certificate details display completely
- [ ] Reset button clears and returns to form
- [ ] Works without authentication

## 📝 Notes for Deployment

1. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` must point to Laravel backend

2. **File Upload:**
   - Max file size configured in frontend (default: no limit in form)
   - Backend handles validation (Laravel)

3. **PDF Download:**
   - Uses browser's Blob API
   - Filename format: `{certificate_number}.pdf`
   - MIME type: application/pdf

4. **Image Previews:**
   - Stored in Laravel: `storage/certificate-templates/previews`
   - Accessed via: `{API_URL}/storage/{preview_path}`

5. **Responsive Design:**
   - Mobile: Single column grid
   - Tablet: 2 column grid for certificates
   - Desktop: Full table view for admin

## 🎯 Next Steps (Optional Enhancements)

1. Add QR code generation for certificates
2. Add certificate preview before download
3. Add bulk certificate generation UI
4. Add certificate analytics dashboard
5. Add email notification for new certificates
6. Add LinkedIn share integration
7. Add certificate expiry tracking
8. Add certificate renewal workflow

## 🔗 Related Documentation

- Backend: `CERTIFICATE_COMPLETE.md`
- Criteria: `CERTIFICATE_CRITERIA.md`
- Templates: `CERTIFICATE_TEMPLATE_SYSTEM.md`
