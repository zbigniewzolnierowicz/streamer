import jwt from "jsonwebtoken";
import config from "../services/config";
import { ICustomJwtPayload } from "../types";

export const createJWT = (claims: object) => {
  return jwt.sign({
    ...claims
  }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

export const decodeJWT = (token: string) => jwt.verify(token, config.jwt.secret) as ICustomJwtPayload;