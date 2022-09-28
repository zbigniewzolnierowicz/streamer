import jwt from "jsonwebtoken";
import config from "../services/config";

export const createJWT = (claims: object) => {
  return jwt.sign({
    ...claims
  }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

export const decodeJWT = (token: string) => jwt.verify(token, config.jwt.secret);