import { Router } from "express";
import { DatabaseConnection } from "../services/database";
import { UserEntity } from "../services/database/entities/user.entity";
import { decodeJWT } from "../utils/jwt";

const router = Router();

router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  const userRepository = DatabaseConnection.getRepository(UserEntity);

  if (!authHeader) {
    return res.redirect("/");
  }

  const token = authHeader.split("Bearer ")[1];
  const claims = decodeJWT(token);

  const possibleUser = await userRepository.findOne({ where: { id: claims.sub } });
  if (!possibleUser) {
    // TODO: Add proper error messages
    return res.json({ message: "No user found lul" });
  }

  return res.json(possibleUser.getPublic());
});

export {
  router
};