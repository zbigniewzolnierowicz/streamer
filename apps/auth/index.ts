import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { BaseOauthClient } from "./services/oauth/base.oauth";
import cookieParser from "cookie-parser";
import { GoogleOauthClient } from "./services/oauth/google.oauth";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(cookieParser())
const port = process.env.PORT || 8080;

app.get("/auth/google", async (req: Request, res: Response) => {
  const GoogleClient = new GoogleOauthClient();
  const { code_verifier, redirectUrl } = GoogleClient.getRedirectUrl();

  res.cookie("code_verifier", code_verifier, { httpOnly: true, maxAge: 5 * 60 * 1000 })
  res.redirect(redirectUrl);
});

app.get("/auth/google/callback", async (req: Request, res: Response) => {
  const GoogleClient = new GoogleOauthClient();
  const code_verifier = req.cookies.code_verifier;

  const { claims } = await GoogleClient.getTokens(req, code_verifier);
  const googleUserID = claims.sub;

  res.json({
    googleUserID
  });
})

const server = app.listen(port, async () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});

process.on("SIGTERM", function () {
  server.close(async function () {
    await prisma.$disconnect();
  });

  setTimeout(function () {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30 * 1000);
});
