import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/user.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);

export default router;