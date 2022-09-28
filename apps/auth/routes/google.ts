import { Router, Request, Response } from "express";
import { DatabaseConnection } from "../services/database";
import { CredentialEntity } from "../services/database/entities/credential.entity";
import { UserEntity } from "../services/database/entities/user.entity";
import { BaseOauthClient } from "../services/oauth/base.oauth";
import { GoogleOauthClient } from "../services/oauth/google.oauth";
import { CredentialType } from "../types";
import { randomString } from "../utils/random";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const OauthClient: BaseOauthClient = new GoogleOauthClient();
  const { code_verifier, redirectUrl } = OauthClient.getRedirectUrl();

  res.cookie("code_verifier", code_verifier, { httpOnly: true, maxAge: 5 * 60 * 1000 });
  res.redirect(redirectUrl);
});

router.get("/callback", async (req: Request, res: Response) => {
  const OauthClient: BaseOauthClient = new GoogleOauthClient();
  const credentialRepository = DatabaseConnection.getRepository(CredentialEntity);
  const userRepository = DatabaseConnection.getRepository(UserEntity);

  const code_verifier = req.cookies.code_verifier;

  if (!code_verifier) {
    throw new Error("No code verifier cookie!");
  }

  const { claims } = await OauthClient.getTokens(req, code_verifier);

  const possibleCredential = await credentialRepository.findOne({ where: { credentialType: CredentialType.GOOGLE }});
  let user: UserEntity;

  if (!possibleCredential) {
    if (!claims.email) {
      throw new Error("No email!");
    }

    const possibleUser = await userRepository.findOne({ where: { email: claims.email } });
    if (possibleUser) {
      throw new Error("User already exists with another credential type!");
    }

    const newUser = await UserEntity.createNewUser({
      username: claims.given_name || randomString(10),
      email: claims.email
    }, {
      credentialType: CredentialType.GOOGLE,
      credentialToken: claims.sub
    });

    user = newUser;
  } else {
    user = possibleCredential.user;
  }

  return res.json({
    access_token: user.getToken()
  });
});

export { router };