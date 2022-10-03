import "reflect-metadata";

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { DatabaseConnection } from "./services/database";
import { router as userInfoRoutes } from "./routes/info.routes";
import { router as registerRoutes } from "./routes/register.routes";
import { DataSource } from "typeorm";
import bodyParser from "body-parser";
import { router as oauthRoutes } from "./routes/oauth.routes";

dotenv.config();

const port = process.env.PORT || 8080;

async function bootstrap(db: DataSource) {
  db.initialize();

  const app = express();

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use("/info", userInfoRoutes);
  app.use("/register", registerRoutes);
  app.use("/auth", oauthRoutes);

  // TODO: Add password reminding mechanism
  // TODO: Add logout with token invalidation
  // TODO: Add MQTT/Kafka publishing of new users
  // TODO: Add gRPC interface

  app.get("/", (_req, res) => {
    return res.send(`
      <html>
        <head>
          <title>Home</title>
        </head>
        <body>
          <a href="/auth/google">Log in with Google</a>
        </body>
      </html>
    `);
  });

  const server = app.listen(port, async () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
  });

  process.on("SIGTERM", function () {
    server.close(async function () {
      await db.destroy();
    });

    setTimeout(function () {
      console.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 30 * 1000);
  });
}

bootstrap(DatabaseConnection);
