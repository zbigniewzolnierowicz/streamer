import { Client, ClientMetadata, generators, Issuer } from "openid-client";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { CredentialType } from "../../types";
import { randomString } from "../../utils/random";
import { DatabaseConnection } from "../database";
import { CredentialEntity } from "../database/entities/credential.entity";
import { UserEntity } from "../database/entities/user.entity";

dotenv.config();

export class BaseOauthClient {
  public client: Client;
  private _scopes: string[] = ["openid"];

  get scopes(): string {
    return this._scopes.join(" ");
  }

  constructor(public issuer: Issuer, public callbackUrl: string, private credentialType: CredentialType, clientMetadata: ClientMetadata, scopes?: string[]) {
    this.client = new issuer.Client(clientMetadata);

    if (scopes)
      this._scopes = scopes;
  }

  getRedirectUrl() {
    if (!(this.issuer && this.client)) {
      throw new Error("Issuer is not working.");
    }

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const redirectUrl = this.client.authorizationUrl({
      scope: this.scopes,
      code_challenge,
      code_challenge_method: "S256",
    });
    return {
      code_verifier,
      redirectUrl
    };
  }

  loginEndpoint = (_req: Request, res: Response) => {
    const { code_verifier, redirectUrl } = this.getRedirectUrl();

    res.cookie("code_verifier", code_verifier, { httpOnly: true, maxAge: 5 * 60 * 1000 });
    return res.redirect(redirectUrl);
  };

  callbackEndpoint = async (req: Request, res: Response) => {
    const credentialRepository = DatabaseConnection.getRepository(CredentialEntity);
    const userRepository = DatabaseConnection.getRepository(UserEntity);

    const code_verifier = req.cookies.code_verifier;

    if (!code_verifier) {
      throw new Error("No code verifier cookie!");
    }

    const { claims } = await this.getTokens(req, code_verifier);

    const possibleCredential = await credentialRepository.findOne({ where: { credentialType: this.credentialType }});
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
        credentialType: this.credentialType,
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

  async getTokens(req: Request, code_verifier: string) {
    if (!(this.issuer && this.client)) {
      throw new Error("Issuer is not working.");
    }

    const params = this.client.callbackParams(req);
    const tokenSet = await this.client.callback(this.callbackUrl, params, { code_verifier });
    return {
      tokens: tokenSet,
      claims: tokenSet.claims()
    };
  }
}