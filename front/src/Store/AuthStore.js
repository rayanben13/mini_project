import axios from "axios";
import { create } from "zustand";

const API_URL = "https://mini-project-1-tcp9.onrender.com/api/auth";

const AuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,

  isAuthenticated: false,
  isHydrated: false,

  // 🔥 INIT AUTH (runs on app start)
  initAuth: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    set({
      token,
      isAuthenticated: !!token,
      isHydrated: true,
    });
  },

  // 🔥 LOGIN
  login: async ({ email, password }) => {
    try {
      set({ loading: true });

      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );

      const { accessToken, role } = response.data;

      localStorage.setItem("token", accessToken);

      set({
        token: accessToken,
        isAuthenticated: true,
        role,
      });

      return {
        success: true,
        accessToken,
        role,
      };
    } catch (error) {
      const serverError = error.response?.data?.error;

      return {
        success: false,
        message: serverError || "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },
  signup: async ({ fullname, username, email, password }) => {
    try {
      set({ loading: true });

      const res = await axios.post(`${API_URL}/register`, {
        fullname,
        username,
        email,
        password,
      });

      // ملاحظة: السيرفر يرسل رسالة نجاح وإيميل، ولا يرسل توكن هنا
      return {
        success: true,
        message: res.data.message,
        email: res.data.email, // مفيد لتوجيه المستخدم لصفحة التحقق
      };
    } catch (error) {
      console.error("Signup error:", error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || "خطأ في عملية التسجيل",
      };
    } finally {
      set({ loading: false });
    }
  },
  verifyEmail: async ({ email, code }) => {
    try {
      console.log("Verifying email:", email, "with code:", code);
      set({ loading: true });

      const response = await axios.post(
        `${API_URL}/verify`,
        {
          email,
          code,
        },
        { withCredentials: true },
      );

      localStorage.setItem("token", response.data.accessToken);
      set({
        token: response.data.accessToken,
        isAuthenticated: true,
        user: {
          token: response.data.accessToken,
        },
      });
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },

  resendVerificationCode: async ({ email }) => {
    try {
      set({ loading: true });

      await axios.post(`${API_URL}/resendVerificationCode`, {
        email,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },

  forgetPassword: async ({ email }) => {
    try {
      set({ loading: true });

      await axios.post(`${API_URL}/forgotPassword`, {
        email,
      });

      return { success: true };
    } catch (error) {
      console.error("Upload error:", error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async ({ email, password, token }) => {
    try {
      set({ loading: true });

      await axios.patch(`${API_URL}/resetPassword/${token}`, {
        email,
        password,
      });

      return { success: true };
    } catch (error) {
      console.error("Upload error:", error.response?.data?.error);

      return {
        success: false,
        message: error.response?.data?.error || "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },

  searchMoreInformation: async ({
    mode,
    name,
    univ,
    year,
    major,
    specialty,
  }) => {
    try {
      set({ loading: true });

      const params = { mode, name };
      if (univ) params.univ = univ;
      if (year) params.year = year;
      if (major) params.major = major;
      if (specialty) {
        params.specialty = specialty;
        params.specialization = specialty;
      }

      const response = await axios.get(`${API_URL}/SharchMoreInformation`, {
        params,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Search error:",
        error.response?.data?.error || error.response?.data?.message,
      );

      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },

  addedUserInformation: async ({ univ, major, specialty, academic_year }) => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token");

      if (!token) {
        return { success: false, message: "Token not found" };
      }

      const payload = {
        univ,
        major,
        academic_year
      };

      // إضافة التخصص فقط في حالة الماستر
      if (["M1", "M2"].includes(academic_year)) {
        payload.specialty = specialty && specialty.trim().length >= 2 ? specialty : "General";
      }


      const response = await axios.post(
        `${API_URL}/addedUserInformation`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Save info error:",
        error.response?.data?.details || error.response?.data?.error || error.response?.data?.message,
      );

      return {
        success: false,
        message: error.response?.data?.details || error.response?.data?.error || error.response?.data?.message || "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },

  refreshToken: async () => {
    try {
      set({ loading: true });
      const response = await axios.post(
        `${API_URL}/token`,
        {},
        { withCredentials: true },
      );

      localStorage.setItem("token", response.data.accessToken);

      set((state) => ({
        user: {
          ...state.user,
          token: response.data.accessToken,
        },
      }));

      return { success: true, accessToken: response.data.accessToken };
    } catch (error) {
      console.error("Refresh token error:", error.response?.data?.error);

      // If refresh token fails, we should probably logout or clear state
      set({
        user: { token: "" },
        statusUser: { statusUS: false },
      });
      localStorage.removeItem("token");

      return {
        success: false,
        message: error.response?.data?.error || "Server error",
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    localStorage.removeItem("token");

    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error.response?.data?.error);
      // Even if the server call fails, we still log the user out locally
    } finally {
      // Always clear all auth state
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      });

      // Force a full page reload to /login so the middleware re-evaluates cookies
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));

export default AuthStore;
