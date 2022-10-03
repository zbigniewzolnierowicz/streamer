import { Router } from "express";
import { DatabaseConnection } from "../services/database";
import { PasswordController } from "../controllers/password.controller";

const router = Router();
const passwordController = new PasswordController(DatabaseConnection);

router.post("/register", passwordController.register);
router.post("/login", passwordController.login);

export {
  router
};