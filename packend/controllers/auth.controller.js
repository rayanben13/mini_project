import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../config/Eamil.js";
import {
  clearAccessToken,
  clearRefreshCookie,
  generateAccessToken,
  generateRefreshToken,
  setAccessToken,
  setRefreshCookie
} from "../config/token.js";

import redis from "../config/redis.js";

import prisma from "../lib/prisma.ts";
import { getUniversities } from "../service/univAPI.js";

let isDevelopment = process.env.NODE_ENV?.trim() === "development";

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
      ? console.log(`🔄 Verification code for ${email}: ${verificationCode}`)
      : await sendVerificationEmail(email, verificationCode);

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
      ? console.log(
        `🔄 New Verification code for ${email}: ${verificationCode}`,
      )
      : await sendVerificationEmail(email, verificationCode);
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
      ? console.log(
        `🎉 Welcome email sent to ${email} and his is the your token ${accessToken}`,
      )
      : await sendWelcomeEmail(email, user.username);

    res.status(200).json({
      message: "Email verified successfully",
      accessToken: accessToken,
      user: {
        // ✅ أضف هذا الكائن
        email: user.email,
        username: user.username,
        avatar: user.img_user || null, // Add avatar to response
      },
    });
  } catch (error) {
    console.log("❌ Error in verify:", error);
    return res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("this is the email and password : ", email, password);
  try {
    const userExists = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (!userExists) {
      return res.status(404).json({ error: "Email is NOT exist " });
    }

    const user_informationExists = await prisma.user_information.findFirst({
      where: {
        id_user: userExists.id_user,
      },
    });

    const needsOnboarding =
      !user_informationExists && userExists.role === "user";

    const user = userExists;
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(404).json({ error: "password or Email is not exist" });
    }
    if (!user.is_active) {
      return res.status(403).json({
        error: "Email not verified",
        verified: false,
        email: user.email, // 🔥 IMPORTANT
      });
    }
    const payload = {
      id: user.id_user,
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    setRefreshCookie(res, refreshToken);
    setAccessToken(res, accessToken);

    if (user.role === "admin") {
      console.log(
        `🎉 Welcome again Admin : ${email} and his token ${accessToken}`,
      );
    } else {
      isDevelopment
        ? console.log(
          `🎉 Welcome again email : ${email} and his token ${accessToken}`,
        )
        : await sendWelcomeEmail(email, user.username);
    }

    return res.status(201).json({
      accessToken,
      user: {
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.img_user || null,
      },
      needsOnboarding,
    });
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
    const userExists = await prisma.users.findUnique({
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
      ? console.log(
        `🔄 Password reset token for ${email} : ${process.env.FRONTEND_URL}/reset-password/${resetToken}?email=${email}}`,
      )
      : await sendPasswordResetEmail(user.email, resetToken);

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
  clearAccessToken(res);
  res.json({ message: "Logged out" });
};

export const SharchMoreInformation = async (req, res) => {
  try {
    const mode = req.query.mode?.trim();
    const name = req.query.name?.trim();

    if (!mode || !name) {
      return res.status(400).json({ message: "choix you Mode and name" });
    }
    if (mode == "univ") {
      let universities = await getUniversities(name);
      universities = universities.slice(0, 4);
      return res.status(200).json({ universities });
    } else if (mode == "major") {
      let majors = await prisma.university_majors.findMany({
        where: {
          major: {
            contains: name,
            mode: "insensitive",
          },
        },
        select: {
          major: true,
        },
        distinct: ["major"],
        take: 4,
      });
      if (majors.length === 0) {
        return res.status(404).json({ message: "No results found" });
      }
      majors = majors.map((item) => item.major);
      return res.status(200).json({ majors });
    } else if (mode == "specialty") {
      const year = req.query.year?.trim();
      const major = req.query.major?.trim();
      if (!year || !major) {
        return res.status(400).json({ message: "enter year and major" });
      }
      let Spercialty = await prisma.university_majors.findMany({
        where: {
          specialization: {
            contains: name,
            mode: "insensitive",
          },
          academic_year: year,
          major: major,
        },
        select: {
          specialization: true,
        },
        distinct: ["specialization"],
        take: 4,
      });
      if (Spercialty.length === 0 || Spercialty === null) {
        return res.status(404).json({ message: "No results found" });
      }
      Spercialty = Spercialty.map((item) => item.specialization);
      return res.status(200).json({ specialty: Spercialty });
    } else if (mode == "subject") {
      const year = req.query.year?.trim();
      const major = req.query.major?.trim();

      const yearAllowed = ["L1", "L2", "L3"];
      let specialization = null;

      if (!yearAllowed.includes(year)) {
        specialization = req.query.specialization?.trim();
      }

      if (!year || !major) {
        return res.status(400).json({ message: "enter year and major" });
      }
      let subject = await prisma.university_majors.findMany({
        where: {
          course: {
            contains: name,
            mode: "insensitive",
          },
          specialization: specialization,
          academic_year: year,
          major: major,
        },
        select: {
          course: true,
        },
        distinct: ["course"],
        take: 4,
      });
      if (subject.length === 0) {
        return res.status(404).json({ message: "No results found" });
      }
      subject = subject.map((item) => item.course);
      return res.status(200).json({ subject });
    }

    return res.status(400).json({ message: "choix you Mode" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const addedUserInformation = async (req, res) => {
  try {
    const { univ, major, specialty, academic_year } = req.body;
    const user = req.user;

    // 1. التحقق من الجامعة
    const universities = await getUniversities(univ);
    if (!universities || universities.length !== 1) {
      return res
        .status(404)
        .json({ message: "university is not exist or invalid" });
    }
    console.log("univvvvvvv", universities);

    // 2. التحقق من وجود التخصص في قاعدة البيانات (جدول المعايير)
    const infoExist = await prisma.university_majors.findFirst({
      where: {
        major: { equals: major, mode: "insensitive" },
        // إذا كانت specialty فارغة، قد تحتاج للبحث عن null أو قيمة فارغة حسب تخزينك
        ...(specialty && {
          specialization: { equals: specialty, mode: "insensitive" },
        }),
        academic_year: academic_year,
      },
    });

    if (!infoExist) {
      return res
        .status(404)
        .json({ message: "information is not exist in our records" });
    }

    // 3. التحقق من أن المستخدم لم يضف بياناته مسبقاً (استخدام findUnique أفضل للـ ID)
    const existingInfo = await prisma.user_information.findUnique({
      where: { id_user: user.id_user },
    });

    if (existingInfo) {
      return res.status(400).json({ message: "information already exists" });
    }

    const infoAdded = await prisma.user_information.create({
      data: {
        id_user: user.id_user,
        university: universities[0], // استخدم اسم الجامعة من API
        major: infoExist.major,
        specialization: infoExist.specialization,
        academic_year: infoExist.academic_year, // سيقبلها إذا كانت ضمن الـ Enum
      },
    });

    return res.status(200).json({
      message: "information is added",
      user_information: infoAdded,
    });
  } catch (err) {
    // طباعة الخطأ كاملًا لمعرفة الحقل المسبب للمشكلة (مثلاً: P2002 أو P2009)
    console.error("Prisma Validation Error Details:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
