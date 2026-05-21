"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* FULLNAME */}
              <div className="space-y-2">
                <Input
                  {...form.register("fullname")}
                  placeholder="Full name"
                  disabled={loading}
                />
              </div>

              {/* USERNAME */}
              <div className="space-y-2">
                <Input
                  {...form.register("username")}
                  placeholder="Username"
                  disabled={loading}
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="Email"
                  disabled={loading}
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-2 relative">
                <Input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  disabled={loading}
                  className="pr-10"
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

              <div className="space-y-2 relative">
                <Input
                  {...form.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  disabled={loading}
                  className="pr-10"
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
              <Link href="/login" className="text-primary">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
