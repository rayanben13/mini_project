"use client";

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
import { authSignupSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import useAuthStore from "../../../Store/AuthStore";

type SignupFormValues = z.infer<typeof authSignupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(authSignupSchema),
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    const result = await signup({
      fullname: values.fullname,
      username: values.username,
      email: values.email,
      password: values.password,
    });

    if (result.success) {
      toast.success("Account created successfully!");
      router.push(
        `/verify-email?email=${encodeURIComponent(values.email)}&from=signup`,
      );
    } else {
      toast.error(result.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
        {/* HEADER */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </CardTitle>

          <CardDescription className="text-gray-500 dark:text-gray-400">
            Fill in the details to create your account
          </CardDescription>
        </CardHeader>

        {/* FORM */}
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* FULLNAME */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>

              <Input
                {...form.register("fullname")}
                placeholder="John Doe"
                disabled={loading}
                className="dark:bg-gray-900 dark:border-gray-700"
              />

              {form.formState.errors.fullname && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.fullname.message}
                </p>
              )}
            </div>

            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>

              <Input
                {...form.register("username")}
                placeholder="johndoe123"
                disabled={loading}
                className="dark:bg-gray-900 dark:border-gray-700"
              />

              {form.formState.errors.username && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

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
                <p className="text-red-500 text-sm">
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

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>

              <Input
                {...form.register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={loading}
                className="dark:bg-gray-900 dark:border-gray-700 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex flex-col gap-2 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:opacity-80 transition"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
