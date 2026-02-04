"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  UserPlusIcon,
  TrashIcon,
  AcademicCapIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { coursesApi, Course } from "@/lib/api/courses";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { certificateTemplateApi, type CertificateTemplate } from "@/lib/api";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null); // TODO: Type properly
  const [loading, setLoading] = useState(true);

  // Certificate Settings State
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [certSettings, setCertSettings] = useState({
    certificate_template_id: null as number | null,
    passing_grade: 70,
    certificate_criteria: "final_grade",
    certificate_quiz_id: null as number | null,
    auto_issue_certificate: true,
    certificate_issue_delay_days: 0,
  });
  const [savingCert, setSavingCert] = useState(false);

  // Enrollment State
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState("5"); // 5=Student
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadCourse(params.id as string);
      loadTemplates();
    }
  }, [params.id]);

  const loadTemplates = async () => {
    try {
      const data = await certificateTemplateApi.getAll({ active_only: true });
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const loadCourse = async (id: string) => {
    try {
      setLoading(true);
      const data = await coursesApi.getOne(id);
      setCourse(data);

      // Populate certificate settings from course data
      setCertSettings({
        certificate_template_id: data.certificate_template_id || null,
        passing_grade: data.passing_grade || 70,
        certificate_criteria: data.certificate_criteria || "final_grade",
        certificate_quiz_id: data.certificate_quiz_id || null,
        auto_issue_certificate:
          data.auto_issue_certificate !== undefined
            ? data.auto_issue_certificate
            : true,
        certificate_issue_delay_days: data.certificate_issue_delay_days || 0,
      });
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error("Gagal memuat detail kelas");
    } finally {
      setLoading(false);
    }
  };

  // Search users for enrollment
  useEffect(() => {
    if (isEnrollOpen) {
      // Fetch users (simple implementation, ideally specific search API)
      // Mocking or using existing endpoint
      const fetchUsers = async () => {
        try {
          const res = await axios.get("/users"); // Ensure this endpoint exists or use similar
          // Filter locally for now or backend search
          setUsers(res.data.data || res.data);
        } catch (e) {
          console.error(e);
        }
      };
      fetchUsers();
    }
  }, [isEnrollOpen]);

  const handleEnroll = async () => {
    if (!selectedUser) return;

    try {
      setEnrolling(true);
      await coursesApi.enrollUser(
        course.id,
        parseInt(selectedUser),
        parseInt(selectedRole),
      );
      toast.success("User berhasil didaftarkan!");
      setIsEnrollOpen(false);
      loadCourse(course.id.toString()); // Reload list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal enroll user");
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (userId: number) => {
    if (!confirm("Yakin ingin mengeluarkan user ini?")) return;

    try {
      await coursesApi.unenrollUser(course.id, userId);
      toast.success("User berhasil dikeluarkan (suspended)");
      loadCourse(course.id.toString());
    } catch (error) {
      toast.error("Gagal unenroll");
    }
  };

  const handleSaveCertificateSettings = async () => {
    try {
      setSavingCert(true);
      await coursesApi.update(course.id, certSettings);
      toast.success("Pengaturan sertifikat berhasil disimpan!");
      loadCourse(course.id.toString());
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan pengaturan",
      );
    } finally {
      setSavingCert(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading Data Kelas...</div>;
  if (!course)
    return <div className="p-8 text-center">Kelas tidak ditemukan</div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali ke Daftar Kelas
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {course.title}
            {course.is_active && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-normal text-sm">
                Active
              </Badge>
            )}
          </h1>
          <p className="text-slate-500 font-mono mt-1">{course.short_name}</p>
        </div>
        <Button
          className="bg-pln-primary"
          onClick={() => setIsEnrollOpen(true)}
        >
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Enroll Siswa
        </Button>
      </div>

      <Tabs defaultValue="enrollments" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="enrollments">
            Peserta ({course.enrollments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="overview">Informasi Kelas</TabsTrigger>
          <TabsTrigger value="certificate">Pengaturan Sertifikat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Detail Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">Moodle ID</Label>
                  <p className="font-medium">
                    {course.moodle_course_id || "Belum tersinkron"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Kategori ID</Label>
                  <p className="font-medium">{course.category_id}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Jadwal</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span>
                      {course.start_date || "-"} s/d {course.end_date || "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-slate-500">Deskripsi</Label>
                <p className="mt-1 text-slate-700">
                  {course.description || "Tidak ada deskripsi"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificate">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Sertifikat</CardTitle>
              <CardDescription>
                Konfigurasi template, kriteria kelulusan, dan penerbitan
                sertifikat untuk kelas ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div>
                <Label htmlFor="template">Template Sertifikat</Label>
                <Select
                  value={
                    certSettings.certificate_template_id?.toString() || "none"
                  }
                  onValueChange={(value) =>
                    setCertSettings({
                      ...certSettings,
                      certificate_template_id:
                        value === "none" ? null : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="template" className="mt-2">
                    <SelectValue placeholder="Pilih template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada template</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name} {t.category && `(${t.category})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  Template yang digunakan untuk generate sertifikat
                </p>
              </div>

              {/* Passing Grade */}
              <div>
                <Label htmlFor="passing_grade">Nilai Kelulusan (%)</Label>
                <Input
                  id="passing_grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={certSettings.passing_grade}
                  onChange={(e) =>
                    setCertSettings({
                      ...certSettings,
                      passing_grade: parseFloat(e.target.value),
                    })
                  }
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Nilai minimum untuk mendapatkan sertifikat
                </p>
              </div>

              {/* Certificate Criteria */}
              <div>
                <Label htmlFor="criteria">Kriteria Penyelesaian</Label>
                <Select
                  value={certSettings.certificate_criteria}
                  onValueChange={(value: any) =>
                    setCertSettings({
                      ...certSettings,
                      certificate_criteria: value,
                    })
                  }
                >
                  <SelectTrigger id="criteria" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="final_grade">
                      <div>
                        <p className="font-medium">
                          Final Grade (Rata-rata Tertimbang)
                        </p>
                        <p className="text-xs text-slate-500">
                          Menggunakan nilai akhir dari semua aktivitas
                        </p>
                      </div>
                    </SelectItem>
                    <SelectItem value="specific_quiz">
                      <div>
                        <p className="font-medium">
                          Specific Quiz (Ujian Tertentu)
                        </p>
                        <p className="text-xs text-slate-500">
                          Berdasarkan nilai dari satu ujian/quiz
                        </p>
                      </div>
                    </SelectItem>
                    <SelectItem value="completion_and_grade">
                      <div>
                        <p className="font-medium">
                          Completion + Grade (Selesai & Lulus)
                        </p>
                        <p className="text-xs text-slate-500">
                          Harus selesai semua materi DAN lulus nilai
                        </p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  {certSettings.certificate_criteria === "final_grade" &&
                    "Sertifikat diterbitkan jika rata-rata tertimbang ≥ passing grade"}
                  {certSettings.certificate_criteria === "specific_quiz" &&
                    "Sertifikat diterbitkan jika nilai quiz tertentu ≥ passing grade (isi Quiz ID di bawah)"}
                  {certSettings.certificate_criteria ===
                    "completion_and_grade" &&
                    "Sertifikat diterbitkan jika menyelesaikan 100% materi DAN nilai ≥ passing grade"}
                </p>
              </div>

              {/* Quiz ID (only if specific_quiz) */}
              {certSettings.certificate_criteria === "specific_quiz" && (
                <div>
                  <Label htmlFor="quiz_id">Moodle Quiz ID</Label>
                  <Input
                    id="quiz_id"
                    type="number"
                    value={certSettings.certificate_quiz_id || ""}
                    onChange={(e) =>
                      setCertSettings({
                        ...certSettings,
                        certificate_quiz_id: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="mt-2"
                    placeholder="Masukkan Moodle Quiz ID"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    ID quiz/exam di Moodle yang akan dijadikan acuan nilai
                    sertifikat
                  </p>
                </div>
              )}

              {/* Auto Issue */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <Label htmlFor="auto_issue" className="cursor-pointer">
                    Auto-Issue Sertifikat
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Otomatis terbitkan sertifikat saat lulus (via cron job)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="auto_issue"
                    type="checkbox"
                    checked={certSettings.auto_issue_certificate}
                    onChange={(e) =>
                      setCertSettings({
                        ...certSettings,
                        auto_issue_certificate: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pln-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pln-primary"></div>
                </label>
              </div>

              {/* Delay Days */}
              <div>
                <Label htmlFor="delay">Delay Penerbitan (Hari)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  max="30"
                  value={certSettings.certificate_issue_delay_days}
                  onChange={(e) =>
                    setCertSettings({
                      ...certSettings,
                      certificate_issue_delay_days:
                        parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Jumlah hari delay setelah lulus sebelum sertifikat diterbitkan
                  (0-30 hari)
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleSaveCertificateSettings}
                  disabled={savingCert}
                  className="w-full bg-pln-primary hover:bg-pln-primary/90"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  {savingCert ? "Menyimpan..." : "Simpan Pengaturan Sertifikat"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Peserta</CardTitle>
              <CardDescription>
                User yang terdaftar dalam kelas ini di Moodle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Peserta</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Join</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.students?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        Belum ada peserta. Silakan Enroll Siswa baru.
                      </TableCell>
                    </TableRow>
                  ) : (
                    course.students?.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-slate-500">
                              {student.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {Number(student.pivot?.moodle_role_id) === 5
                              ? "Student"
                              : Number(student.pivot?.moodle_role_id) === 4
                                ? "Editing Teacher"
                                : Number(student.pivot?.moodle_role_id) === 3
                                  ? "Non-Editing Teacher"
                                  : Number(student.pivot?.moodle_role_id) === 2
                                    ? "Course Creator"
                                    : Number(student.pivot?.moodle_role_id) ===
                                        1
                                      ? "Manager"
                                      : "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {student.pivot?.status === "active" ? (
                            <span className="text-emerald-600 text-sm flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="text-red-500 text-sm">
                              Suspended
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {student.pivot?.enrolled_at
                            ? new Date(
                                student.pivot.enrolled_at,
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleUnenroll(student.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enroll Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Peserta Baru</DialogTitle>
            <DialogDescription>
              Pilih user untuk didaftarkan ke kelas ini. User akan otomatis
              dibuatkan akun Moodle jika belum ada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pilih User</Label>
              {/* Simple Select for MVP - Replace with Combobox for large user base */}
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih user..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role Moodle</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Student (Siswa)</SelectItem>
                  <SelectItem value="4">
                    Editing Teacher (Instruktur Penuh)
                  </SelectItem>
                  <SelectItem value="3">
                    Non-Editing Teacher (Asisten)
                  </SelectItem>
                  <SelectItem value="2">Course Creator (Admin)</SelectItem>
                  <SelectItem value="1">Manager (Super Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={enrolling || !selectedUser}
            >
              {enrolling ? "Processing..." : "Enroll Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
