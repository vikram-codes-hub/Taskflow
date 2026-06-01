import prisma from "../../config/db.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Users fetched successfully", users);
  } catch (err) {
    return sendError(res, "Failed to fetch users", 500);
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, "User fetched successfully", user);
  } catch (err) {
    return sendError(res, "Failed to fetch user", 500);
  }
};