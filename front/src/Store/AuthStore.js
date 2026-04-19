import Cookies from "js-cookie";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { authService } from "../services/authService";
import { tokenManager } from "../utils/tokenManager";

// Initialize isAuthenticated based on token existence
const initialIsAuthenticated = tokenManager.exists();

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: initialIsAuthenticated, // Add this line
};

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Helper to handle async operations
        handleAsync: async (asyncFn, onSuccess, onError) => {
          set({ loading: true, error: null });
          try {
            const result = await asyncFn();
            if (onSuccess) onSuccess(result);
            return { success: true, data: result };
          } catch (error) {
            let errorMessage = "Server error";

            // Properly handle different error types
            if (error.response) {
              // Server responded with error
              errorMessage =
                error.response.data?.error ||
                error.response.data?.message ||
                errorMessage;
            } else if (error.request) {
              // No response from server
              errorMessage =
                "No response from server. Please check your internet connection.";
            } else {
              // Request setup error or custom error
              errorMessage = error.message || errorMessage;
            }

            set({ error: errorMessage });

            // Call custom error handler if provided
            if (onError) {
              return onError(error);
            }

            return { success: false, message: errorMessage };
          } finally {
            set({ loading: false });
          }
        },

        login: async (email, password) => {
          return get().handleAsync(
            async () => {
              const response = await authService.login(email, password);
              console.log("Login response:", response);

              const userData = response.data || response;

              // التحقق من وجود التوكن مباشرة
              if (userData && userData.accessToken) {
                Cookies.set("accessToken", userData.accessToken, {
                  expires: 7,
                  path: "/", // لضمان وصول الكوكي لكل الصفحات
                  sameSite: "strict",
                  secure: process.env.NODE_ENV === "production",
                });
                tokenManager.set(userData.accessToken);

                set({
                  user: {
                    token: userData.accessToken,
                    email: userData.user?.email || email,
                    username: userData.user?.username,
                    avatar: userData.user?.avatar,
                    role: userData.user?.role,
                  },
                  isAuthenticated: true,
                });

                return { success: true, data: userData };
              }
              return {
                success: false,
                message: "Invalid response from server",
              };
            },
            undefined,
            async (error) => {
              const isEmailNotVerified =
                error.response?.status === 403 &&
                (error.response.data?.verified === false ||
                  error.response.data?.error?.includes("Email not verified"));

              if (isEmailNotVerified) {
                return {
                  success: false,
                  message: error.response.data.error || "Email not verified",
                  emailNotVerified: true,
                  email: error.response.data.email || email,
                };
              }

              const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                "Login failed";
              return { success: false, message: errorMessage };
            },
          );
        },

        signup: async (fullname, username, email, password) => {
          return get().handleAsync(() =>
            authService.signup(fullname, username, email, password),
          );
        },

        verifyEmail: async (email, code) => {
          return get().handleAsync(
            () => authService.verifyEmail(email, code),
            (data) => {
              tokenManager.set(data.accessToken);
              set({
                user: {
                  token: data.accessToken,
                  email: data.user.email, // Add user email
                  username: data.user.username, // Add username
                  avatar: data.user.avatar,
                },
                isAuthenticated: true, // Update this state
              });
            },
          );
        },

        resendVerificationCode: async (email) => {
          return get().handleAsync(() =>
            authService.resendVerificationCode(email),
          );
        },

        forgotPassword: async (email) => {
          return get().handleAsync(() => authService.forgotPassword(email));
        },

        resetPassword: async (email, password, token) => {
          return get().handleAsync(() =>
            authService.resetPassword(email, password, token),
          );
        },

        searchMoreInformation: async (params) => {
          return get().handleAsync(() =>
            authService.searchMoreInformation(params),
          );
        },

        addUserInformation: async (univ, major, spercialty, academic_year) => {
          return get().handleAsync(() =>
            authService.addUserInformation(
              univ,
              major,
              spercialty,
              academic_year,
            ),
          );
        },

        logout: async () => {
          tokenManager.remove();
          try {
            await authService.logout();
            Cookies.remove("accessToken");
          } catch (error) {
            console.error("Logout error:", error);
          } finally {
            set({
              ...initialState,
              user: null,
              isAuthenticated: false, // Update this state
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated, // Persist this state
        }),
      },
    ),
  ),
);

export default useAuthStore;
