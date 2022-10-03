import { ClientMetadata, Issuer } from "openid-client";
import { CredentialType } from "../../types";
import config from "../config";
import { BaseOauthClient } from "./base.oauth";

export class GoogleOauthClient extends BaseOauthClient {
  constructor() {
    const googleIssuer = new Issuer({
      issuer: "https://accounts.google.com",
      authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      revocation_endpoint: "https://oauth2.googleapis.com/revoke",
      revocation_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
      token_endpoint: "https://oauth2.googleapis.com/token",
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
      jwks_uri: "https://www.googleapis.com/oauth2/v3/certs"
    });
    const callbackUrl = config.auth.oauth.google.callbackUrl;
    const clientMetadata: ClientMetadata = {
      client_id: config.auth.oauth.google.clientId,
      client_secret: config.auth.oauth.google.clientSecret,
      response_types: ["code"],
      redirect_uris: [callbackUrl]
    };

    super(googleIssuer, callbackUrl, CredentialType.GOOGLE, clientMetadata, ["openid", "profile", "email"]);
  }
}