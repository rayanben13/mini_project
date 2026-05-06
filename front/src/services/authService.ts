import axios from "axios";
import { API_CONFIG } from "../constants/apiConfig";
import { tokenManager } from "../utils/tokenManager";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // Re-throw the error so handleAsync can process it
      throw error;
    }
  },

  signup: async (fullname, username, email, password) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER, {
      fullname,
      username,
      email,
      password,
    });
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.VERIFY, {
      email,
      code,
    });
    return response.data;
  },

  resendVerificationCode: async (email: string) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.RESEND_CODE, {
      email,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.FORGOT_PASSWORD,
      {
        email,
      },
    );
    return response.data;
  },

  resetPassword: async (email, password, token) => {
    const response = await apiClient.patch(
      `${API_CONFIG.ENDPOINTS.RESET_PASSWORD}/${token}`,
      { email, password },
    );
    return response.data;
  },

  searchMoreInformation: async (params) => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.SEARCH_INFO, {
      params,
    });
    return response.data;
  },

  addUserInformation: async (univ, major, specialty, academic_year) => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.ADD_USER_INFO, {
      univ,
      major,
      specialty,
      academic_year,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
    return response.data;
  },
};
