import "reflect-metadata";

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { DatabaseConnection } from "./services/database";
import { router as googleRoutes } from "./routes/google";

dotenv.config();

const port = process.env.PORT || 8080;

function bootstrap() {
    DatabaseConnection.initialize();

    const app = express();
    app.use(cookieParser());
    app.use("/auth/google", googleRoutes);
    const server = app.listen(port, async () => {
        console.log(`[server]: Server is running at https://localhost:${port}`);
    });

    process.on("SIGTERM", function () {
        server.close(async function () {
            await DatabaseConnection.destroy();
        });

        setTimeout(function () {
            console.error(
                "Could not close connections in time, forcefully shutting down"
            );
            process.exit(1);
        }, 30 * 1000);
    });
}

bootstrap();