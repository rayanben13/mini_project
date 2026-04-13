import jwt from 'jsonwebtoken';
import 'dotenv/config';
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_TTL =
  process.env.MODE_ENV === 'production' ? process.env.ACCESS_TOKEN_TTL : '300d';
const REFRESH_TOKEN_TTL_DAYS = process.env.REFRESH_TOKEN_TTL_DAYS || 7;

// 🔹 توليد access token
export const generateAccessToken = (user) =>
  jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

// 🔹 توليد refresh token
export const generateRefreshToken = (user) =>
  jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d`,
  });

// 🔹 حفظ refresh token في الكوكيز
export const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV.trim() === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

// 🔹 حذف الكوكيز عند تسجيل الخروج
export const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV.trim() === 'production',
    sameSite: 'lax',
    path: '/',
  });
};
