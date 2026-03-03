// src/lib/validators/auth.schema.ts

import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be less than 100 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),

    specialityId: z.string().min(1, "Please select a speciality"),

    yearId: z.string().min(1, "Please select a year"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// النوع اللي يرجعلنا من الـ Schema
export type RegisterFormData = z.infer<typeof registerSchema>;

// نوع الأخطاء اللي ترجع من Server Action
export type RegisterFormState = {
  errors?: {
    fullName?: string[];
    email?: string[];
    specialityId?: string[];
    yearId?: string[];
    password?: string[];
    confirmPassword?: string[];
    _form?: string[]; // أخطاء عامة (مثل: الإيميل موجود)
  };
  success?: boolean;
};
