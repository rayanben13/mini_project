// src/app/(auth)/register/page.tsx

"use client";

import { Speciality, Year } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
// import api from '@/lib/api';
import { registerAction } from "@/actions/auth.action";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // ════════════════════════════════
  // Server Action مع useActionState
  // ════════════════════════════════
  const [state, formAction, isPending] = useActionState(registerAction, {
    errors: {},
  });

  useEffect(() => {
    if (state.success) {
      router.push("/");
      router.refresh();
    }
  }, [state.success, router]);

  // ════════════════════════════════
  // State تاع الفورم (client-side فقط للـ UI)
  // ════════════════════════════════
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialityId, setSpecialityId] = useState("");
  const [yearId, setYearId] = useState("");

  // ════════════════════════════════
  // جيب التخصصات والسنوات
  // ════════════════════════════════
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [years, setYears] = useState<Year[]>([]);

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const [specRes, yearRes] = await Promise.all([
  //           api.get('/specialities'),
  //           api.get('/years'),
  //         ]);
  //         setSpecialities(specRes.data);
  //         setYears(yearRes.data);
  //       } catch (err) {
  //         console.error('Failed to fetch data:', err);
  //       }
  //     };
  //     fetchData();
  //   }, []);

  // ════════════════════════════════
  // Password checks (UI فقط)
  // ════════════════════════════════
  const passwordChecks = {
    length: password.length >= 6,
    match: password === confirmPassword && confirmPassword !== "",
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      {/* ════════ خلفية ديكور ════════ */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-100 opacity-50 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* ════════ LOGO ════════ */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-1 text-gray-500">Join StudentFiles community</p>
        </div>

        {/* ════════ CARD ════════ */}
        <Card className="border-0 shadow-xl shadow-gray-200/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Fill in your information to get started
            </CardDescription>
          </CardHeader>

          {/* ═══════════════════════════════════ */}
          {/*  FORM مع Server Action             */}
          {/* ═══════════════════════════════════ */}
          <form action={formAction}>
            <CardContent className="space-y-4">
              {/* ═══ General Error (من السيرفر) ═══ */}
              {state.errors?._form && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {state.errors._form[0]}
                </div>
              )}

              {/* ═══ Full Name ═══ */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Ahmed Benali"
                    className={`pl-10 ${
                      state.errors?.fullName
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                </div>
                {/* ═══ خطأ الاسم ═══ */}
                {state.errors?.fullName && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.fullName[0]}
                  </p>
                )}
              </div>

              {/* ═══ Email ═══ */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 ${
                      state.errors?.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                </div>
                {state.errors?.email && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* ═══ Speciality + Year ═══ */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* التخصص */}
                <div className="space-y-2">
                  <Label>Speciality</Label>
                  {/* 
                    حيلة: Select تاع ShadCN ما يبعتش القيمة في FormData
                    لازم نضيفو hidden input
                  */}
                  <input
                    type="hidden"
                    name="specialityId"
                    value={specialityId}
                  />
                  <Select
                    value={specialityId}
                    onValueChange={(value) => setSpecialityId(value)}
                  >
                    <SelectTrigger
                      className={`w-full ${
                        state.errors?.specialityId
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Select speciality" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {specialities.map((spec) => (
                        <SelectItem key={spec.id} value={spec.id.toString()}>
                          {spec.icon} {spec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state.errors?.specialityId && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.specialityId[0]}
                    </p>
                  )}
                </div>

                {/* السنة */}
                <div className="space-y-2">
                  <Label>Year</Label>
                  <input type="hidden" name="yearId" value={yearId} />
                  <Select
                    value={yearId}
                    onValueChange={(value) => setYearId(value)}
                  >
                    <SelectTrigger
                      className={`w-full ${
                        state.errors?.yearId
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Select year" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state.errors?.yearId && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.yearId[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* ═══ Password ═══ */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${
                      state.errors?.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {state.errors?.password && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {/* ═══ Confirm Password ═══ */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 ${
                      state.errors?.confirmPassword
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {state.errors?.confirmPassword && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.confirmPassword[0]}
                  </p>
                )}
              </div>

              {/* ═══ Password Checks (UI only) ═══ */}
              {password && (
                <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        passwordChecks.length
                          ? "text-green-500"
                          : "text-gray-300"
                      }`}
                    />
                    <span
                      className={
                        passwordChecks.length
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      At least 6 characters
                    </span>
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          passwordChecks.match
                            ? "text-green-500"
                            : "text-red-400"
                        }`}
                      />
                      <span
                        className={
                          passwordChecks.match
                            ? "text-green-600"
                            : "text-red-500"
                        }
                      >
                        Passwords match
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* ═══ Submit Button ═══ */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* ═══ Login Link ═══ */}
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
