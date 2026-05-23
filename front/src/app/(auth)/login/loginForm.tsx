"use client";

import useAuthStore from "@/Store/AuthStore";
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
import { authLoginSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type LoginFormValues = z.infer<typeof authLoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const searchParams = useSearchParams();
  const fromModal = searchParams.get("from") === "modal";
  const file_id = searchParams.get("file_id");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login({
        email: values.email,
        password: values.password,
      });

      if (!result.success) {
        if (result.message === "Email not verified") {
          toast.error(result.message);

          router.push(
            `/verify-email?email=${encodeURIComponent(
              result.email || values.email,
            )}&from=login`,
          );

          return;
        }

        if (result.message === "User information is NOT exist ") {
          toast.error("Fill your information");
          router.push("/onboarding");
          return;
        }

        toast.error(result.message || "Invalid email or password");
        return;
      }

      toast.success("Login successful!");

      if (result.role === "admin") {
        router.replace("/admin");
      } else {
        if (fromModal && file_id) {
          // Redirect to dashboard/[file_id] if coming from modal or profile view
          console.log("Redirecting to file page with ID:", file_id);
          router.replace(`/dashboard/${file_id}`);
          return;
        } else {
          router.replace("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
      {/* HEADER */}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Login
        </CardTitle>

        <CardDescription className="text-gray-500 dark:text-gray-400">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      {/* FORM */}
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>

            <Input
              {...form.register("email")}
              type="email"
              placeholder="your@email.com"
              disabled={loading}
              className="dark:bg-gray-900 dark:border-gray-700"
            />

            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>

            <Input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={loading}
              className="dark:bg-gray-900 dark:border-gray-700 pr-10"
            />

            {/* toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            {/* error */}
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* FORGOT PASSWORD */}
          <div className="flex justify-end text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:opacity-80 transition"
            >
              Forgot password?
            </Link>
          </div>

          {/* SUBMIT */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex flex-col gap-2 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:opacity-80 transition"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
