// src/actions/auth.action.ts

"use server";

import {
  RegisterFormState,
  registerSchema,
} from "@/lib/validators/auth.schema";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function registerAction(
  prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const rawData = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    specialityId: formData.get("specialityId") as string,
    yearId: formData.get("yearId") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validatedFields = registerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: validatedFields.data.fullName,
        email: validatedFields.data.email,
        password: validatedFields.data.password,
        specialityId: Number(validatedFields.data.specialityId),
        yearId: Number(validatedFields.data.yearId),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        errors: {
          _form: [data.message || "Registration failed"],
        },
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: "/",
    });

    return { success: true };
  } catch (error) {
    return {
      errors: {
        _form: ["Something went wrong. Please try again."],
      },
    };
  }
}
