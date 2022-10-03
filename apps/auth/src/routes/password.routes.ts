import { Router } from "express";
import { DatabaseConnection } from "../services/database";
import { PasswordController } from "../controllers/password.controller";

const router = Router();
const registerController = new PasswordController(DatabaseConnection);

router.post("/", registerController.register);

export {
  router
};