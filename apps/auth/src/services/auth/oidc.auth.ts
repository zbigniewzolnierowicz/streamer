import { BaseOauthClient } from "./base-oauth.auth";
import { Issuer, ClientMetadata } from "openid-client";
import { CredentialType } from "../../types";

export class OIDCOauthClient extends BaseOauthClient {
  static async getOIDCIssuer(discoveryUrl: string) {
    return Issuer.discover(discoveryUrl);
  }

  static async getOIDCClient(discoveryUrl: string, callbackUrl: string, credentialType: CredentialType, clientMetadata: ClientMetadata) {
    const issuer = await this.getOIDCIssuer(discoveryUrl);
    return new BaseOauthClient(issuer, callbackUrl, credentialType, clientMetadata);
  }

}