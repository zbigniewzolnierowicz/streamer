import { Request, Response } from "express";
import { DataSource } from "typeorm";
import { CredentialEntity } from "../services/database/entities/credential.entity";
import { UserEntity } from "../services/database/entities/user.entity";
import { BaseOauthClient } from "../services/oauth/base.oauth";
import { randomString } from "../utils/random";

export class OauthController {
  private oauth: BaseOauthClient;

  constructor(oauth: BaseOauthClient, private db: DataSource) {
    this.oauth = oauth;
    this.login = this.login.bind(this);
    this.callback = this.callback.bind(this);
  }

  login(_req: Request, res: Response) {
    const { code_verifier, redirectUrl } = this.oauth.getRedirectUrl();

    res.cookie("code_verifier", code_verifier, { httpOnly: true, maxAge: 5 * 60 * 1000 });
    return res.redirect(redirectUrl);
  };

  async callback(req: Request, res: Response) {
    const credentialRepository = this.db.getRepository(CredentialEntity);
    const userRepository = this.db.getRepository(UserEntity);
    const credentialType = this.oauth.getCredentialType();

    const code_verifier = req.cookies.code_verifier;

    if (!code_verifier) {
      throw new Error("No code verifier cookie!");
    }

    const { claims } = await this.oauth.getTokens(req, code_verifier);

    const possibleCredential = await credentialRepository.findOne({ where: { credentialType: credentialType }});
    let user: UserEntity;

    if (!possibleCredential) {
      if (!claims.email) {
        throw new Error("No email!");
      }

      const possibleUser = await userRepository.findOne({ where: { email: claims.email } });
      if (possibleUser) {
        // TODO: Implement the logic for adding credentials to an existing user
        throw new Error("User already exists with another credential type!");
      }

      const newUser = await UserEntity.createNewUser({
        username: claims.given_name || randomString(10),
        email: claims.email,
      }, {
        credentialType: credentialType,
        credentialToken: claims.sub
      });

      user = newUser;
    } else {
      user = possibleCredential.user;
    }

    return res.json({
      access_token: user.getToken()
    });
  };
}
