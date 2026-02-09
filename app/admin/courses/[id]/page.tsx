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
import axios from "@/lib/axios";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null); // TODO: Type properly
  const [loading, setLoading] = useState(true);

  // Enrollment State
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState("5"); // 5=Student
  const [enrolling, setEnrolling] = useState(false);

  // Certificate upload state
  const [uploadTarget, setUploadTarget] = useState<any>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [showZipUpload, setShowZipUpload] = useState(false);
  const [zipUploading, setZipUploading] = useState(false);
  const [zipResults, setZipResults] = useState<{ matched: string[]; unmatched: string[]; total_matched: number; total_unmatched: number } | null>(null);

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

  const handleUploadCert = async (file: File, student: any) => {
    try {
      setUploadingCert(true);
      await certificateApi.uploadForUser(course.id, student.id, file);
      toast.success(`Sertifikat untuk ${student.name} berhasil diupload!`);
      setUploadTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal upload sertifikat");
    } finally {
      setUploadingCert(false);
    }
  };

  const handleUploadZip = async (file: File) => {
    try {
      setZipUploading(true);
      const result = await certificateApi.uploadBulkZip(course.id, file);
      setZipResults(result);
      toast.success(`Selesai! ${result.total_matched} matched, ${result.total_unmatched} unmatched`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal upload ZIP");
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
            Peserta ({course.enrollments?.length || 0})
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
                <CardTitle>Daftar Peserta</CardTitle>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <EllipsisVerticalIcon className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setUploadTarget(student)}>
                                <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                                Upload Sertifikat
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleUnenroll(student.id)}
                              >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Hapus Peserta
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
              Upload file ZIP berisi PDF sertifikat. Nama file harus NIP atau nama peserta.
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
