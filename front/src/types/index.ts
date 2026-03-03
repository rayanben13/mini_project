// src/types/index.ts

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "guest" | "student" | "admin";
  specialityId: number | null;
  yearId: number | null;
  speciality?: Speciality;
  year?: Year;
}

export interface Speciality {
  id: number;
  name: string;
  icon?: string;
}

export interface Year {
  id: number;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
