import { Router } from "express";
import { BaseOauthClient } from "../services/auth/base-oauth.auth";
import { GoogleOauthClient } from "../services/auth/google.auth";
import { OauthController } from "../controllers/oauth.controller";
import { DatabaseConnection } from "../services/database";


const router = Router();

const oauthClients = new Map([
  ["google", new GoogleOauthClient()]
]);

const registerRoute = (client: BaseOauthClient) => {
  const router = Router();
  const controller = new OauthController(client, DatabaseConnection);
  router.get("/", controller.login);
  router.get("/callback", controller.callback);
  return router;
};

oauthClients.forEach((client, name) => {
  router.use(`/${name}`, registerRoute(client));
});

export {
  router
};