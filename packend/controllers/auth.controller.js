import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../config/Eamil.js";
import {
  clearRefreshCookie,
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
} from "../config/token.js";

import redis from "../config/redis.js";

import prisma from "../lib/prisma.ts";

let isDevelopment = process.env.NODE_ENV === "development";

export const register = async (req, res) => {
  const { email, password, username, fullname } = req.body;

  try {
    const userExists = await prisma.users.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (userExists) {
      return res.status(404).json({ error: "Email or user name is exist " });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await redis.set(
      `verificationCode:${email}`,
      verificationCode,
      "EX",
      15 * 60,
    );

    isDevelopment
      ? await sendVerificationEmail(email, verificationCode)
      : console.log(`🔄 Verification code for ${email}: ${verificationCode}`);

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.users.create({
      data: {
        username,
        fullname,
        email,
        password: hashedPassword,
      },
      select: {
        id_user: true,
        username: true,
        email: true,
      },
    });

    res.status(200).json({ message: "Verification code sent to email", email });
  } catch (error) {
    console.log("❌ Error in register:", error);
    res.status(500).json({
      error: "Server error",
    });
  }
};

export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const userExists = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!userExists) {
      return res.status(404).json({ error: "Email is NOT exist " });
    }
    await redis.del(`verificationCode:${email}`);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await redis.set(
      `verificationCode:${email}`,
      verificationCode,
      "EX",
      15 * 60,
    );
    isDevelopment
      ? await sendVerificationEmail(email, verificationCode)
      : console.log(
          `🔄 New Verification code for ${email}: ${verificationCode}`,
        );
    res
      .status(200)
      .json({ message: "New verification code sent to your email" });
  } catch (error) {
    console.log("❌ Error in resendVerificationCode:", error);
    return res.status(500).json(error);
  }
};

export const verify = async (req, res) => {
  const { email, code } = req.body;

  try {
    const storedCode = await redis.get(`verificationCode:${email}`);
    console.log("🔄 storedCode from Redis:", storedCode);
    if (!storedCode) {
      return res.status(400).json({ message: "Code expired or invalid" });
    }

    if (storedCode !== code) {
      return res.status(400).json({ message: "Invalid code" });
    }

    const result = await prisma.users.update({
      data: { is_active: true, role: "user" },
      where: {
        email,
      },
    });

    const user = result;
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found or already verified" });
    const payload = {
      id: user.id_user,
      email: user.email,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    setRefreshCookie(res, refreshToken);

    await redis.del(`verificationCode:${email}`);
    isDevelopment
      ? await sendWelcomeEmail(email, user.username)
      : console.log(
          `🎉 Welcome email sent to ${email} and his is the your token ${accessToken}`,
        );

    res.status(200).json({
      message: "Email verified successfully",
      id: user.id_user,
      accessToken: accessToken,
    });
  } catch (error) {
    console.log("❌ Error in verify:", error);
    return res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
console.log("this is the email and password : ",email, password);
  try {
    const userExists = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (!userExists) {
      return res.status(404).json({ error: "Email is NOT exist " });
    }
    const user = userExists;
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(404).json({ error: "password or Email is not exist" });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: "Email not verified" });
    }
    const payload = {
      id: user.id_user,
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    setRefreshCookie(res, refreshToken);

if(user.role === "admin"){
     console.log(
          `🎉 Welcome again Admin : ${email} and his token ${accessToken}`,
        );
}
  else{isDevelopment
      ? await sendWelcomeEmail(email, user.username)
      : console.log(
          `🎉 Welcome again email : ${email} and his token ${accessToken}`,
        );}  


   return res.status(201).json({ accessToken, id: user.id_user });


  } catch (error) {
    process.env.NODE_ENV === "development" &&
      console.log("❌ Error in login:", error);
    res.status(500).json({
      error: "Server error",
    });
  }
};

export const token = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "No refresh token" });
  console.log("this is the refersh token : ", process.env.REFRESH_TOKEN_SECRET);
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    const payload = {
      id: user.id,
      email: user.email,
    };

    const newAccessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken: newAccessToken });
  });
};


export const forgotPassword = async (req, res) => {
  const email = req.body.email;

  try {
    const userExists = await prisma.users.findFirst({
      where: {
        email,
      },
    });
    const user = userExists;
    if (!user) {
      return res.status(404).json({ error: "Email is NOT exist " });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    await redis.set(`forgotPassword:${email}`, resetToken, "EX", 3600);

    isDevelopment
      ? await sendPasswordResetEmail(user.email, resetToken)
      : console.log(
          `🔄 Password reset token for ${email} : ${process.env.FRONTEND_URL}/resetPassword/${resetToken}`,
        );

    return res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.log("❌ Error in forgotPassword:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { password, email } = req.body;
  const { resetTokenURL } = req.params;

  try {
    const resetToken = await redis.get(`forgotPassword:${email}`);
    console.log("🔄 resetToken from Redis:", resetToken);
    console.log("🔄 resetToken from params:", resetTokenURL);
    if (resetToken !== resetTokenURL) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.users.update({
      where: {
        email,
      },
      data: { password: hashedPassword },
    });
    await redis.del(`forgotPassword:${email}`);

    return res.status(200).json({ message: "Update password is done" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};


export const logout = (req, res) => {
  clearRefreshCookie(res);
  res.json({ message: "Logged out" });
};

