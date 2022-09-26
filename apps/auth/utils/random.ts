import { randomBytes } from "crypto";

export const randomString = (length: number) => randomBytes(Math. floor(length / 2)).toString("hex");