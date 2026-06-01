import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import { generateToken } from "../../utils/jwt.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return sendError(res, "Email already in use", 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken({ id: user.id, role: user.role });
    return sendSuccess(res, "User registered successfully", { user, token }, 201);
  } catch (err) {
    return sendError(res, "Registration failed", 500);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return sendError(res, "Invalid credentials", 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return sendError(res, "Invalid credentials", 401);

    const token = generateToken({ id: user.id, role: user.role });
    const { password: _, ...safeUser } = user;
    return sendSuccess(res, "Login successful", { user: safeUser, token });
  } catch (err) {
    return sendError(res, "Login failed", 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, "User fetched successfully", user);
  } catch (err) {
    return sendError(res, "Failed to fetch user", 500);
  }
};