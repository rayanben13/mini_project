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
import { emailSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import useAuthStore from "@/Store/AuthStore";

type ForgotPasswordFormValues = z.infer<typeof emailSchema>;

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
  const { forgetPassword, loading } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    const result = await forgetPassword({ email: values.email });

    if (result.success) {
      toast.success("Password reset link sent!");
      setSuccess(true);
    } else {
      toast.error(result.message || "Failed to send reset link");
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>

          <CardTitle className="text-2xl text-gray-900 dark:text-white font-bold">
            Email Sent!
          </CardTitle>

          <CardDescription className="text-gray-500 dark:text-gray-400">
            Check your inbox for a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            We&apos;ve sent an email with instructions to reset your password.
            If you don&apos;t see it, check your spam folder.
          </p>
        </CardContent>

        <CardFooter>
          <button
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition"
          >
            Return to Login
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot Password
        </CardTitle>

        <CardDescription className="text-gray-500 dark:text-gray-400">
          Enter your email to receive a reset link
        </CardDescription>
      </CardHeader>

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
              <p className="text-red-500 text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{" "}
          <button
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
            className="text-primary hover:underline transition font-bold"
          >
            Return to Login
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}
