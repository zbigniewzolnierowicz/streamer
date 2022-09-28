import { Router } from "express";
import { decodeJWT } from "../utils/jwt";

const router = Router();

router.get("/", (req, res) => {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader) {
    return res.redirect("/");
  }

  const token = authHeader.split("Bearer ")[1];

  return res.json(decodeJWT(token));
});

export {
  router
};