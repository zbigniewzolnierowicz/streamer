import dotenv from "dotenv";

dotenv.config();

const oauthBaseUrl = "/auth/oauth";
const passwordBasePath = "/auth/local";

const service = {
  base: process.env.BASE_URL || "http://localhost:8080"
};

const config = {
  service,
  database: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "user",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DB || "streamer",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "secret",
    expiresIn: "1h"
  },
  auth: {
    password: {
      basePath: passwordBasePath,
      baseUrl: service.base + passwordBasePath
    },
    oauth: {
      basePath: oauthBaseUrl,
      google: {
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || service.base + oauthBaseUrl + "/google/callback",
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }
    },
    email: {
      secret: "dingus"
    }
  },
};

export default config;