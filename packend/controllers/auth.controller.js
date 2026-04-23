import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../config/Eamil.js';
import {
  clearRefreshCookie,
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
} from '../config/token.js';

import redis from '../config/redis.js';

import prisma from '../lib/prisma.ts';
import { getUniversities } from '../service/univAPI.js';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const register = async (req, res) => {
  const { email, password, username, fullname } = req.body;

  try {
    const userExists = await prisma.users.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (userExists) {
      return res.status(404).json({ error: 'Email or user name is exist ' });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    await redis.set(
      `verificationCode:${email}`,
      verificationCode,
      'EX',
      15 * 60
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

    res.status(200).json({ message: 'Verification code sent to email', email });
  } catch (error) {
    console.log('❌ Error in register:', error);
    res.status(500).json({
      error: 'Server error',
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
      return res.status(404).json({ error: 'Email is NOT exist ' });
    }
    await redis.del(`verificationCode:${email}`);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    await redis.set(
      `verificationCode:${email}`,
      verificationCode,
      'EX',
      15 * 60
    );
    isDevelopment
      ? console.log(
          `🔄 New Verification code for ${email}: ${verificationCode}`
        )
      : await sendVerificationEmail(email, verificationCode);
    res
      .status(200)
      .json({ message: 'New verification code sent to your email' });
  } catch (error) {
    console.log('❌ Error in resendVerificationCode:', error);
    return res.status(500).json(error);
  }
};

export const verify = async (req, res) => {
  const { email, code } = req.body;

  try {
    const storedCode = await redis.get(`verificationCode:${email}`);
    console.log('🔄 storedCode from Redis:', storedCode);
    if (!storedCode) {
      return res.status(400).json({ message: 'Code expired or invalid' });
    }

    if (storedCode !== code) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    const result = await prisma.users.update({
      data: { is_active: true, role: 'user' },
      where: {
        email,
      },
    });

    const user = result;
    if (!user)
      return res
        .status(400)
        .json({ message: 'User not found or already verified' });
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
          `🎉 Welcome email sent to ${email} and his is the your token ${accessToken}`
        )
      : await sendWelcomeEmail(email, user.username);

    res.status(200).json({
      message: 'Email verified successfully',
      role: user.role,
      accessToken: accessToken,
    });
  } catch (error) {
    console.log('❌ Error in verify:', error);
    return res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('this is the email and password : ', email, password);
  try {
    const userExists = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (!userExists) {
      return res.status(404).json({ error: 'Email is NOT exist ' });
    }

    const user_informationExists = await prisma.user_information.findFirst({
      where: {
        id_user: userExists.id_user,
      },
    });

    if (!user_informationExists && userExists.role === 'user') {
      return res.status(404).json({ error: 'User information is NOT exist ' });
    }

    const user = userExists;
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(404).json({ error: 'password or Email is not exist' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Email not verified' });
    }
    const payload = {
      id: user.id_user,
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    setRefreshCookie(res, refreshToken);

    if (user.role === 'admin') {
      console.log(
        `🎉 Welcome again Admin : ${email} and his token ${accessToken}`
      );
    } else {
      isDevelopment
        ? console.log(
            `🎉 Welcome again email : ${email} and his token ${accessToken}`
          )
        : await sendWelcomeEmail(email, user.username);
    }

    return res.status(201).json({ role: user.role, accessToken });
  } catch (error) {
    process.env.NODE_ENV === 'development' &&
      console.log('❌ Error in login:', error);
    res.status(500).json({
      error: 'Server error',
    });
  }
};

export const token = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  console.log('this is the refersh token : ', process.env.REFRESH_TOKEN_SECRET);
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid refresh token' });

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
      return res.status(404).json({ error: 'Email is NOT exist ' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    await redis.set(`forgotPassword:${email}`, resetToken, 'EX', 3600);

    isDevelopment
      ? console.log(
          `🔄 Password reset token for ${email} : ${process.env.FRONTEND_URL}/resetPassword/${resetToken}`
        )
      : await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({
      message: 'Password reset link sent to your email',
    });
  } catch (err) {
    console.log('❌ Error in forgotPassword:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  const { password, email } = req.body;
  const { resetTokenURL } = req.params;

  try {
    const resetToken = await redis.get(`forgotPassword:${email}`);
    console.log('🔄 resetToken from Redis:', resetToken);
    console.log('🔄 resetToken from params:', resetTokenURL);
    if (resetToken !== resetTokenURL) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.users.update({
      where: {
        email,
      },
      data: { password: hashedPassword },
    });
    await redis.del(`forgotPassword:${email}`);

    return res.status(200).json({ message: 'Update password is done' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (req, res) => {
  clearRefreshCookie(res);
  res.json({ message: 'Logged out' });
};

export const SharchMoreInformation = async (req, res) => {
  try {
    const mode = req.query.mode?.trim();
    const name = req.query.name?.trim();

    if (!mode || !name) {
      return res.status(400).json({
        message: 'mode and name are required',
      });
    }

    const yearAllowed = ['L1', 'L2', 'L3'];

    switch (mode) {
      case 'univ': {
        let universities = await getUniversities(name);
        return res.status(200).json({
          data: universities.slice(0, 4),
        });
      }

      case 'major': {
        const majors = await prisma.university_majors.findMany({
          where: {
            major: {
              contains: name,
              mode: 'insensitive',
            },
          },
          select: { major: true },
          distinct: ['major'],
          take: 4,
        });

        if (!majors.length) {
          return res.status(404).json({ message: 'No results found' });
        }

        return res.status(200).json({
          data: majors.map((m) => m.major),
        });
      }

      case 'specialty': {
        const year = req.query.year?.trim();
        const major = req.query.major?.trim();

        if (!year || !major) {
          return res.status(400).json({
            message: 'year and major are required',
          });
        }

        if (yearAllowed.includes(year)) {
          return res.status(400).json({
            message: 'Specialization not available for this year',
          });
        }

        const specialties = await prisma.university_majors.findMany({
          where: {
            specialization: {
              contains: name,
              mode: 'insensitive',
            },
            academic_year: { equals: year, mode: 'insensitive' },
            major: { contains: major, mode: 'insensitive' },
          },
          select: { specialization: true },
          distinct: ['specialization'],
          take: 4,
        });

        if (!specialties.length) {
          return res.status(404).json({ message: 'No results found' });
        }

        return res.status(200).json({
          data: specialties.map((s) => s.specialization),
        });
      }

      case 'subject': {
        const year = req.query.year?.trim();
        const major = req.query.major?.trim();

        if (!year || !major) {
          return res.status(400).json({
            message: 'year and major are required',
          });
        }

        let specialization;

        if (yearAllowed.includes(year)) {
          specialization = undefined;
        } else {
          specialization = req.query.specialization?.trim();
          if (!specialization) {
            return res.status(400).json({
              message: 'specialization is required',
            });
          }
        }

        const subjects = await prisma.university_majors.findMany({
          where: {
            course: {
              contains: name,
              mode: 'insensitive',
            },
            academic_year: year,
            major: { contains: major, mode: 'insensitive' },
            ...(specialization && {
              specialization: { contains: specialization, mode: 'insensitive' },
            }),
          },
          select: { course: true },
          distinct: ['course'],
          take: 4,
        });

        if (!subjects.length) {
          return res.status(404).json({ message: 'No results found' });
        }

        return res.status(200).json({
          data: subjects.map((s) => s.course),
        });
      }

      default:
        return res.status(400).json({
          message: 'Invalid mode',
        });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Server error',
    });
  }
};

export const addedUserInformation = async (req, res) => {
  try {
    const { univ, major, spercialty, academic_year } = req.body;
    const user = req.user;

    const universities = await getUniversities(univ);

    if (user.role !== 'user') {
      return res.status(404).json({ message: 'you are not user' });
    }

    if (universities.length === 0) {
      return res.status(404).json({ message: 'university is not exist' });
    }
    if (universities.length > 1) {
      return res.status(404).json({ message: 'university is not exist' });
    }

    const infoExist = await prisma.university_majors.findFirst({
      where: {
        major: { equals: major, mode: 'insensitive' },
        specialization: { equals: spercialty || null, mode: 'insensitive' },
        academic_year: academic_year,
      },
    });
    if (!infoExist) {
      return res
        .status(404)
        .json({ message: 'you are not added this information' });
    }
    const result = await prisma.user_information.findFirst({
      where: {
        id_user: user.id_user,
      },
    });
    if (result) {
      return res
        .status(404)
        .json({ message: 'you added information is already exist' });
    }

    const infoAdded = await prisma.users.update({
      where: { id_user: user.id_user },
      data: {
        user_information: {
          create: {
            university: universities[0],
            major: infoExist.major,
            specialization: infoExist.specialization,
            academic_year: infoExist.academic_year,
          },
        },
      },
      select: {
        user_information: true,
      },
    });
    const user_information = infoAdded.user_information;
    return res
      .status(200)
      .json({ message: 'information is added', user_information });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
