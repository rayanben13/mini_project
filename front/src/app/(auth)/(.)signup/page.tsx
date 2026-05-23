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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authSignupSchema } from "@/lib/validations/auth";
import useAuthStore from "@/Store/AuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type SignupFormValues = z.infer<typeof authSignupSchema>;

export default function SignupModalPage() {
  const router = useRouter();
  const { signup, loading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(authSignupSchema),
    mode: "onChange",
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

      reset();

      router.replace(
        `/verify-email?email=${encodeURIComponent(values.email)}&from=signup`,
      );
    } else {
      toast.error(result.message || "Signup failed");
    }
  };

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
        <DialogTitle className="sr-only">Sign up</DialogTitle>

        <Card className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* FULLNAME */}
              <div className="space-y-2">
                <Input
                  {...register("fullname")}
                  placeholder="Full name"
                  disabled={loading}
                  className={errors.fullname ? "border-red-500" : ""}
                />

                {errors.fullname && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.fullname.message}
                  </p>
                )}
              </div>

              {/* USERNAME */}
              <div className="space-y-2">
                <Input
                  {...register("username")}
                  placeholder="Username"
                  disabled={loading}
                  className={errors.username ? "border-red-500" : ""}
                />

                {errors.username && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Email"
                  disabled={loading}
                  className={errors.email ? "border-red-500" : ""}
                />

                {errors.email && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    disabled={loading}
                    className={`pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    disabled={loading}
                    className={`pr-10 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* SUBMIT */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </CardContent>

          {/* FOOTER */}
          <CardFooter className="flex flex-col gap-2 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
