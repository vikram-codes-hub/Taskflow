import prisma from "../../config/db.js";
import redis from "../../config/redis.js";
import { sendSuccess, sendError } from "../../utils/response.js";

const CACHE_KEY = "tasks:all";

export const getAllTasks = async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return sendSuccess(res, "Tasks fetched successfully (cache)", cached);
    }

    const tasks = await prisma.task.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    await redis.set(CACHE_KEY, tasks, { ex: 60 });
    return sendSuccess(res, "Tasks fetched successfully", tasks);
  } catch (err) {
    return sendError(res, "Failed to fetch tasks", 500);
  }
};

export const createTask = async (req, res) => {
  const { title, description, priority, dueDate, assignedTo } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { id: assignedTo } });
    if (!userExists) return sendError(res, "Assigned user not found", 404);

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await redis.del(CACHE_KEY);
    return sendSuccess(res, "Task created successfully", task, 201);
  } catch (err) {
    return sendError(res, "Failed to create task", 500);
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!existing) return sendError(res, "Task not found", 404);

    if (req.body.assignedTo) {
      const userExists = await prisma.user.findUnique({
        where: { id: req.body.assignedTo },
      });
      if (!userExists) return sendError(res, "Assigned user not found", 404);
    }

    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await redis.del(CACHE_KEY);
    return sendSuccess(res, "Task updated successfully", task);
  } catch (err) {
    return sendError(res, "Failed to update task", 500);
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!existing) return sendError(res, "Task not found", 404);

    await prisma.task.delete({ where: { id: Number(id) } });
    await redis.del(CACHE_KEY);
    return sendSuccess(res, "Task deleted successfully");
  } catch (err) {
    return sendError(res, "Failed to delete task", 500);
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedTo: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Your tasks fetched successfully", tasks);
  } catch (err) {
    return sendError(res, "Failed to fetch tasks", 500);
  }
};

export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) return sendError(res, "Task not found", 404);
    if (task.assignedTo !== req.user.id)
      return sendError(res, "Not authorized to update this task", 403);

    const updated = await prisma.task.update({
      where: { id: Number(id) },
      data: { status },
    });

    await redis.del(CACHE_KEY);
    return sendSuccess(res, "Task status updated", updated);
  } catch (err) {
    return sendError(res, "Failed to update status", 500);
  }
};