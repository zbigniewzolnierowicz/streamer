import "reflect-metadata";

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { GoogleOauthClient } from "./services/oauth/google.oauth";
import { DatabaseConnection } from "./services/database";
import { CredentialEntity } from "./services/database/entities/credential.entity";
import { UserEntity } from "./services/database/entities/user.entity";
import { randomString } from "./utils/random";
import { CredentialType } from "./types";

dotenv.config();

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 8080;

app.get("/auth/google", async (req: Request, res: Response) => {
    const GoogleClient = new GoogleOauthClient();
    const { code_verifier, redirectUrl } = GoogleClient.getRedirectUrl();

    res.cookie("code_verifier", code_verifier, { httpOnly: true, maxAge: 5 * 60 * 1000 });
    res.redirect(redirectUrl);
});

app.get("/auth/google/callback", async (req: Request, res: Response) => {
    const GoogleClient = new GoogleOauthClient();
    const credentialRepository = DatabaseConnection.getRepository(CredentialEntity);
    const userRepository = DatabaseConnection.getRepository(UserEntity);

    const code_verifier = req.cookies.code_verifier;
    const { claims } = await GoogleClient.getTokens(req, code_verifier);

    const possibleCredential = await credentialRepository.findOne({ where: { credentialType: CredentialType.GOOGLE }});

    if (!possibleCredential) {
        if (!claims.email) {
            throw new Error("No email!");
        }

        const possibleUser = await userRepository.findOne({ where: { email: claims.email } });
        if (possibleUser) {
            throw new Error("User already exists with another credential type!");
        }

        const user = await UserEntity.createNewUser({
            username: claims.given_name || randomString(10),
            email: claims.email
        }, {
            credentialType: CredentialType.GOOGLE,
            credentialToken: claims.sub
        });

        return res.json(user);
    }

    return res.json(possibleCredential.user);
});

DatabaseConnection.initialize();

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
