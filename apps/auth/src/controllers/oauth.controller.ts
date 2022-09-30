import { Router } from "express";
import { BaseOauthClient } from "../services/oauth/base.oauth";

export const oauthController = (oauth: BaseOauthClient) => {
  const router = Router();

  router.get("/", oauth.loginEndpoint);
  router.get("/callback", oauth.callbackEndpoint);

  return router;
};