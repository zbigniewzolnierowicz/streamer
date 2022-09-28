import { BaseOauthClient } from "./base.oauth";
import { Issuer, ClientMetadata } from "openid-client";

export class OIDCOauthClient extends BaseOauthClient {
  static async getOIDCIssuer(discoveryUrl: string) {
    return Issuer.discover(discoveryUrl);
  }

  static async getOIDCClient(discoveryUrl: string, callbackUrl: string, clientMetadata: ClientMetadata) {
    const issuer = await this.getOIDCIssuer(discoveryUrl);
    return new BaseOauthClient(issuer, callbackUrl, clientMetadata);
  }

}