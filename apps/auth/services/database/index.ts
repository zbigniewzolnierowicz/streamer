import { DataSource } from "typeorm";
import { CredentialEntity } from "./entities/credential.entity";
import { UserEntity } from "./entities/user.entity";

export const DatabaseConnection = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "test",
    password: "test",
    database: "test",
    synchronize: true,
    logging: false,
    entities: [UserEntity, CredentialEntity],
    subscribers: [],
    migrations: [],
})