"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  UserPlusIcon,
  TrashIcon,
  CalendarIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  ArrowUpTrayIcon,
  ArchiveBoxArrowDownIcon,
  ChartBarIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import certificateApi from "@/lib/api/certificates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

interface CourseStudent {
  id: number;
  name: string;
  email: string;
  employee_id?: string;
  pivot?: {
    moodle_role_id: number;
    status: string;
    enrolled_at: string;
  };
}

interface CourseDetail extends Course {
  students?: CourseStudent[];
}

interface ProgressData {
  progress: number;
  completed_activities: number;
  total_with_completion: number;
  total_activities: number;
  course_grade?: string | null;
  last_access?: string | null;
  progress_mode?: string;
  activities: Array<{
    name: string;
    type: string;
    completion_status: number;
    grade?: number | null;
    grade_raw?: number | null;
    grade_max?: number | null;
    has_completion: boolean;
  }>;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Enrollment State
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<CourseStudent[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<CourseStudent[]>([]);
  const [selectedRole, setSelectedRole] = useState("5"); // 5=Student
  const [enrolling, setEnrolling] = useState(false);

  // Change role state
  const [roleTarget, setRoleTarget] = useState<CourseStudent | null>(null);
  const [newRole, setNewRole] = useState("");

  // Certificate upload state
  const [uploadTarget, setUploadTarget] = useState<CourseStudent | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [showZipUpload, setShowZipUpload] = useState(false);
  const [zipUploading, setZipUploading] = useState(false);
  const [zipResults, setZipResults] = useState<{ matched: string[]; unmatched: string[]; total_matched: number; total_unmatched: number } | null>(null);

  // Progress tracking state
  const [progressTarget, setProgressTarget] = useState<CourseStudent | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadCourse(params.id as string);
    }
  }, [params.id]);

  const loadCourse = async (id: string) => {
    try {
      setLoading(true);
      const data = await coursesApi.getOne(id);
      setCourse(data);
    } catch (error) {
      toast.error("Gagal memuat detail kelas");
    } finally {
      setLoading(false);
    }
  };

  // Search users for enrollment with debounce
  useEffect(() => {
    if (!isEnrollOpen) return;
    if (searchUser.length < 2) {
      setUsers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await axios.get(`/users?search=${encodeURIComponent(searchUser)}`);
        setUsers(res.data.data || res.data);
      } catch (e) {
        // error handled silently
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchUser, isEnrollOpen]);

  const handleEnroll = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setEnrolling(true);
      let success = 0;
      let failed = 0;
      for (const u of selectedUsers) {
        try {
          await coursesApi.enrollUser(course.id, u.id, parseInt(selectedRole));
          success++;
        } catch {
          failed++;
        }
      }
      if (failed > 0) {
        toast.warning(`${success} berhasil, ${failed} gagal didaftarkan`);
      } else {
        toast.success(`${success} user berhasil didaftarkan!`);
      }
      setIsEnrollOpen(false);
      setSelectedUsers([]);
      setSearchUser("");
      loadCourse(course.id.toString());
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Gagal enroll user"
        : error instanceof Error ? error.message : "Gagal enroll user";
      toast.error(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };

  const handleChangeRole = async () => {
    if (!roleTarget || !newRole) return;
    try {
      await coursesApi.updateEnrollmentRole(course.id, roleTarget.id, parseInt(newRole));
      toast.success("Role berhasil diubah!");
      setRoleTarget(null);
      loadCourse(course.id.toString());
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Gagal mengubah role"
        : error instanceof Error ? error.message : "Gagal mengubah role";
      toast.error(errorMessage);
    }
  };

  const handleUnenroll = async (userId: number) => {
    const confirmed = await confirm({ title: "Remove Learner", description: "Yakin ingin mengeluarkan user ini dari kelas?", confirmText: "Ya, Hapus", variant: "destructive" });
    if (!confirmed) return;

    try {
      await coursesApi.unenrollUser(course.id, userId);
      toast.success("User berhasil dikeluarkan (suspended)");
      loadCourse(course.id.toString());
    } catch (error) {
      toast.error("Gagal unenroll");
    }
  };

  const handleViewProgress = async (student: CourseStudent) => {
    setProgressTarget(student);
    setProgressData(null);
    setProgressLoading(true);
    try {
      const data = await coursesApi.getUserProgress(course!.id, student.id);
      setProgressData(data);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Gagal memuat data progress"
        : error instanceof Error ? error.message : "Gagal memuat data progress";
      toast.error(errorMessage);
      setProgressTarget(null);
    } finally {
      setProgressLoading(false);
    }
  };

  const getCompletionLabel = (status: number) => {
    switch (status) {
      case 1: return { text: "Selesai", color: "text-emerald-600", bg: "bg-emerald-100" };
      case 2: return { text: "Lulus", color: "text-emerald-600", bg: "bg-emerald-100" };
      case 3: return { text: "Tidak Lulus", color: "text-red-600", bg: "bg-red-100" };
      default: return { text: "Belum", color: "text-slate-500", bg: "bg-slate-100" };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz": return "📝";
      case "assign": return "📋";
      case "resource": return "📄";
      case "url": return "🔗";
      case "page": return "📃";
      case "forum": return "💬";
      case "book": return "📚";
      case "lesson": return "📖";
      case "feedback": return "📊";
      case "scorm": return "🎓";
      default: return "📌";
    }
  };

  const handleUploadCert = async (file: File, student: CourseStudent) => {
    try {
      setUploadingCert(true);
      await certificateApi.uploadForUser(course!.id, student.id, file);
      toast.success(`Sertifikat untuk ${student.name} berhasil diupload!`);
      setUploadTarget(null);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Gagal upload sertifikat"
        : error instanceof Error ? error.message : "Gagal upload sertifikat";
      toast.error(errorMessage);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleUploadZip = async (file: File) => {
    try {
      setZipUploading(true);
      const result = await certificateApi.uploadBulkZip(course!.id, file);
      setZipResults(result);
      toast.success(`Selesai! ${result.total_matched} matched, ${result.total_unmatched} unmatched`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Gagal upload ZIP"
        : error instanceof Error ? error.message : "Gagal upload ZIP";
      toast.error(errorMessage);
    } finally {
      setZipUploading(false);
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
            Learners ({course.enrollments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="overview">Informasi Kelas</TabsTrigger>
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

        <TabsContent value="enrollments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Learner List</CardTitle>
                <CardDescription>
                  User yang terdaftar dalam kelas ini di Moodle.
                </CardDescription>
              </div>
              <button
                onClick={() => { setShowZipUpload(true); setZipResults(null); }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ArchiveBoxArrowDownIcon className="w-4 h-4" />
                Upload ZIP (Bulk)
              </button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner Name</TableHead>
                    <TableHead>NIP</TableHead>
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
                        colSpan={6}
                        className="text-center py-8 text-slate-500"
                      >
                        No learners yet. Enroll new learners.
                      </TableCell>
                    </TableRow>
                  ) : (
                    course.students?.map((student: CourseStudent) => (
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
                          <span className="text-sm text-slate-600 font-mono">
                            {student.employee_id || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {Number(student.pivot?.moodle_role_id) === 5
                              ? "Student"
                              : Number(student.pivot?.moodle_role_id) === 3
                                ? "Editing Teacher"
                                : Number(student.pivot?.moodle_role_id) === 4
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <EllipsisVerticalIcon className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProgress(student)}>
                                <ChartBarIcon className="w-4 h-4 mr-2" />
                                Lihat Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setRoleTarget(student); setNewRole(String(student.pivot?.moodle_role_id || 5)); }}>
                                <UserPlusIcon className="w-4 h-4 mr-2" />
                                Ubah Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setUploadTarget(student)}>
                                <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                                Upload Sertifikat
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleUnenroll(student.id)}
                              >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Remove Learner
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Single Certificate Upload Dialog */}
      <Dialog open={!!uploadTarget} onOpenChange={(o) => !o && setUploadTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Sertifikat</DialogTitle>
            <DialogDescription>
              Upload file PDF sertifikat untuk <strong>{uploadTarget?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="file"
              accept=".pdf"
              disabled={uploadingCert}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && uploadTarget) handleUploadCert(file, uploadTarget);
              }}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pln-primary file:text-white hover:file:bg-pln-primary/90"
            />
            {uploadingCert && <p className="text-sm text-slate-500 mt-2">Mengupload...</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadTarget(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ZIP Bulk Upload Dialog */}
      <Dialog open={showZipUpload} onOpenChange={setShowZipUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Sertifikat Massal (ZIP)</DialogTitle>
            <DialogDescription>
              Upload file ZIP berisi PDF sertifikat. Nama file harus NIP atau learner name.
              Matching: NIP tepat → nama tepat → nama sebagian.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <input
              type="file"
              accept=".zip"
              disabled={zipUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadZip(file);
              }}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pln-primary file:text-white hover:file:bg-pln-primary/90"
            />
            {zipUploading && <p className="text-sm text-slate-500">Memproses ZIP...</p>}
            {zipResults && (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  ✓ Matched ({zipResults.total_matched}):
                </p>
                {zipResults.matched.map((m, i) => (
                  <p key={i} className="pl-3 text-slate-600 dark:text-slate-400">{m}</p>
                ))}
                {zipResults.unmatched.length > 0 && (
                  <>
                    <p className="font-medium text-red-600 mt-2">
                      ✗ Tidak cocok ({zipResults.total_unmatched}):
                    </p>
                    {zipResults.unmatched.map((u, i) => (
                      <p key={i} className="pl-3 text-slate-600 dark:text-slate-400">{u}</p>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowZipUpload(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={!!progressTarget} onOpenChange={(o) => { if (!o) { setProgressTarget(null); setProgressData(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Learner Progress</DialogTitle>
            <DialogDescription>
              {progressTarget?.name} — {progressTarget?.email}
            </DialogDescription>
          </DialogHeader>

          {progressLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-pln-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : progressData ? (
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-pln-primary">{progressData.progress}%</p>
                  <p className="text-xs text-slate-500">Progress</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {progressData.completed_activities}/{progressData.total_with_completion}
                  </p>
                  <p className="text-xs text-slate-500">
                    {progressData.progress_mode === "grades" ? "Dinilai" : "Aktivitas Selesai"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {progressData.course_grade !== null ? `${progressData.course_grade}` : "-"}
                  </p>
                  <p className="text-xs text-slate-500">Nilai Akhir</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress Keseluruhan{progressData.progress_mode === "grades" ? " (berdasarkan nilai)" : ""}</span>
                  <span>{progressData.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progressData.progress >= 70 ? "bg-emerald-500" :
                      progressData.progress >= 40 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${progressData.progress}%` }}
                  />
                </div>
              </div>

              {/* Last Access */}
              <p className="text-xs text-slate-500">
                Terakhir diakses: {progressData.last_access
                  ? new Date(progressData.last_access).toLocaleString("id-ID")
                  : "Belum pernah"}
              </p>

              {/* Activities List */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Daftar Aktivitas ({progressData.total_activities})
                </h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-200 dark:divide-slate-700">
                  {progressData.activities.map((activity: ProgressData['activities'][0], idx: number) => {
                    const completion = getCompletionLabel(activity.completion_status);
                    return (
                      <div key={idx} className="flex items-center justify-between px-3 py-2.5 text-sm">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="flex-shrink-0">{getActivityIcon(activity.type)}</span>
                          <div className="min-w-0">
                            <p className="truncate text-slate-800 dark:text-white">{activity.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{activity.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          {activity.grade !== null && (
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              {activity.grade_raw}/{activity.grade_max}
                            </span>
                          )}
                          {activity.has_completion && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${completion.bg} ${completion.color}`}>
                              {completion.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setProgressTarget(null); setProgressData(null); }}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={(open) => { setIsEnrollOpen(open); if (!open) { setSearchUser(""); setSelectedUsers([]); setUsers([]); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enroll New Learner</DialogTitle>
            <DialogDescription>
              Cari dan pilih beberapa user sekaligus. User akan otomatis
              dibuatkan akun Moodle jika belum ada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cari User</Label>
              <Command className="border rounded-md" shouldFilter={false}>
                <CommandInput
                  placeholder="Ketik nama, email, atau NIP..."
                  value={searchUser}
                  onValueChange={setSearchUser}
                />
                <CommandList>
                  {searchUser.length >= 2 && !searchLoading && users.filter((u) => !selectedUsers.some((s) => s.id === u.id)).length === 0 && (
                    <CommandEmpty>Tidak ditemukan user</CommandEmpty>
                  )}
                  {searchUser.length >= 2 && users.filter((u) => !selectedUsers.some((s) => s.id === u.id)).length > 0 && (
                    <CommandGroup heading="Hasil Pencarian">
                      {users.filter((u) => !selectedUsers.some((s) => s.id === u.id)).map((u) => (
                        <CommandItem
                          key={u.id}
                          value={u.id.toString()}
                          onSelect={() => { setSelectedUsers((prev) => [...prev, u]); setSearchUser(""); setUsers([]); }}
                          className="cursor-pointer"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email} {u.employee_id ? `| NIP: ${u.employee_id}` : ""}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {searchLoading && (
                    <div className="py-4 text-center text-sm text-muted-foreground">Mencari...</div>
                  )}
                </CommandList>
              </Command>
              {/* Selected users chips */}
              {selectedUsers.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dipilih ({selectedUsers.length} user)</Label>
                  <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-2 bg-muted/50 rounded-md border">
                    {selectedUsers.map((u) => (
                      <Badge key={u.id} variant="secondary" className="flex items-center gap-1 py-1 px-2 pr-1">
                        <span className="text-xs">{u.name}</span>
                        <button
                          onClick={() => setSelectedUsers((prev) => prev.filter((s) => s.id !== u.id))}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Role Moodle</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Student (Siswa)</SelectItem>
                  <SelectItem value="3">Editing Teacher (Instruktur Penuh)</SelectItem>
                  <SelectItem value="4">Non-Editing Teacher (Asisten)</SelectItem>
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
              disabled={enrolling || selectedUsers.length === 0}
            >
              {enrolling ? "Processing..." : `Enroll ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""} Sekarang`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!roleTarget} onOpenChange={(open) => { if (!open) setRoleTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Role Moodle</DialogTitle>
            <DialogDescription>
              Ubah role untuk <span className="font-semibold">{roleTarget?.name}</span> di kelas ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Baru</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Student (Siswa)</SelectItem>
                  <SelectItem value="3">Editing Teacher (Instruktur Penuh)</SelectItem>
                  <SelectItem value="4">Non-Editing Teacher (Asisten)</SelectItem>
                  <SelectItem value="2">Course Creator (Admin)</SelectItem>
                  <SelectItem value="1">Manager (Super Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>
              Batal
            </Button>
            <Button onClick={handleChangeRole}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </div>
  );
}
