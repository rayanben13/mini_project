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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type LoginFormValues = z.infer<typeof authLoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login({
        email: values.email,
        password: values.password,
      });

      if (result.success) {
        toast.success("Login successful!");
        const role = result.user?.role;
        if (result.needsOnboarding) {
          router.push("/onboarding");
        } else {
          if (role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
        }


      } else {
        if (result.message === "Email not verified") {
          toast.error(result.message);
          router.push(
            `/verify-email?email=${encodeURIComponent(
              result.email || values.email,
            )}&from=login`,
          );
        } else {
          toast.error("Invalid email or password");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
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
                <p className="text-red-500 text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>

              <Input
                {...form.register("password")}
                type="password"
                placeholder="••••••••"
                disabled={loading}
                className="dark:bg-gray-900 dark:border-gray-700"
              />

              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">
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
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
              disabled={loading}
            >
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
    </div>
  );
}
