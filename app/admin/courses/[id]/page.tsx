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
          const res = await axios.get("/api/users"); // Ensure this endpoint exists or use similar
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
                            {student.pivot?.moodle_role_id === 5
                              ? "Student"
                              : "Teacher"}
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
                  <SelectItem value="3">Non-Editing Teacher</SelectItem>
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
