import { Router } from "express";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
  updateTaskStatus,
} from "../controllers/task.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createTaskSchema, updateTaskSchema, updateStatusSchema } from "../schemas/task.schema.js";

const router = Router();

router.use(authenticate);

router.get("/my", getMyTasks);
router.patch("/:id/status", validate(updateStatusSchema), updateTaskStatus);

router.get("/", authorizeRoles("ADMIN"), getAllTasks);
router.post("/", authorizeRoles("ADMIN"), validate(createTaskSchema), createTask);
router.put("/:id", authorizeRoles("ADMIN"), validate(updateTaskSchema), updateTask);
router.delete("/:id", authorizeRoles("ADMIN"), deleteTask);

export default router;