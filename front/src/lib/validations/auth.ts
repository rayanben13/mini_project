import { z } from "zod";

const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,128}$/;

// ----------------------
// Email Schema
// ----------------------
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .trim(),
});

// ----------------------
// Password Schema
// ----------------------
export const passwordSchema = z.object({
  password: z.string().min(1, "Password is required").regex(passwordRegex, {
    message:
      "Password must be at least 8 characters long and contain at least one letter and one number",
  }),
});

// ----------------------
// Login Schema
// ----------------------
export const authLoginSchema = emailSchema.merge(passwordSchema);

// ----------------------
// Signup Schema
// ----------------------
export const authSignupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(100, "Email must be less than 100 characters")
      .trim(),

    password: z.string().min(1, "Password is required").regex(passwordRegex, {
      message:
        "Password must be at least 8 characters long and contain at least one letter and one number",
    }),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must be less than 30 characters")
      .regex(/^[a-zA-Z0-9]+$/, {
        message: "Username can only contain letters and numbers",
      })
      .trim(),

    fullname: z
      .string()
      .min(1, "Full name is required")
      .min(3, "Full name must be at least 3 characters long")
      .max(30, "Full name must be less than 30 characters")
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ----------------------
// Username Schema
// ----------------------
export const usernameSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username can only contain letters and numbers",
    })
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be less than 30 characters")
    .trim()
    .optional(),
});

// ----------------------
// User Information Schema
// ----------------------
export const userInformationSchema = z.object({
  univ: z
    .string()
    .min(1, "University is required")
    .min(3, "University name must be at least 3 characters long")
    .max(50, "University name must be less than 50 characters")
    .trim(),

  major: z
    .string()
    .min(1, "Major is required")
    .min(3, "Major must be at least 3 characters long")
    .max(30, "Major must be less than 30 characters")
    .trim(),

  specialty: z
    .string()
    .min(1, "Specialty is required")
    .min(2, "Specialty must be at least 2 characters long")
    .max(30, "Specialty must be less than 30 characters")
    .trim(),

  academic_year: z
    .string()
    .min(1, "Academic year is required")
    .max(30, "Academic year must be less than 30 characters")
    .trim(),
});

// ----------------------
// Verify Email Schema
// ----------------------
export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Verification code must be 6 characters long"),
});

// ----------------------
// Reset Password Schema
// ----------------------
export const resetPasswordSchema = z
  .object({
    password: z.string().min(1, "Password is required").regex(passwordRegex, {
      message:
        "Password must be at least 8 characters long and contain at least one letter and one number",
    }),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
