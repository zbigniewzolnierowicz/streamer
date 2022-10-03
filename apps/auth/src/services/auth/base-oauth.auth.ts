import { Client, ClientMetadata, generators, Issuer } from "openid-client";
import dotenv from "dotenv";
import { Request } from "express";
import { CredentialType } from "../../types";

dotenv.config();

export class BaseOauthClient {
  public client: Client;
  private _scopes: string[] = ["openid", "profile", "email"];

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

  public getCredentialType() {
    return this.credentialType;
  }
}