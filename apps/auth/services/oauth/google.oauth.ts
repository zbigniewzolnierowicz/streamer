import { ClientMetadata, Issuer } from "openid-client";
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
        const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 8080}/auth/google/callback`;
        const clientMetadata: ClientMetadata = {
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            response_types: ["code"],
            redirect_uris: [callbackUrl]
        };

        super(googleIssuer, callbackUrl, clientMetadata, ["openid", "profile", "email"]);
    }
}