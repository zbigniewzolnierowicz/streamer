import { DataSource } from "typeorm";
import config from "../config";
import { CredentialEntity } from "./entities/credential.entity";
import { EmailConfirmationEntity } from "./entities/emailconfirmation.entity";
import { UserEntity } from "./entities/user.entity";

export const DatabaseConnection = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.database,
  synchronize: true,
  logging: false,
  entities: [UserEntity, CredentialEntity, EmailConfirmationEntity],
  subscribers: [],
  migrations: [],
});