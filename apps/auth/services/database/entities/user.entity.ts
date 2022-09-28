import { IUser } from "common/user";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DatabaseConnection } from "..";
import { ICredential } from "../../../types";
import { createJWT } from "../../../utils/jwt";
import { CredentialEntity } from "./credential.entity";

@Entity()
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column()
  public username: string;

  @Column()
  public email: string;

  @OneToMany(() => CredentialEntity, (credential) => credential.user)
  public credentials: CredentialEntity[];

  static fromBody(userMetadata: IUser): UserEntity {
    const newUser = new UserEntity();
    Object.assign(newUser, userMetadata);

    return newUser;
  }

  static async createNewUser(
    userMetadata: IUser,
    credentialMetadata: ICredential
  ): Promise<UserEntity> {
    const userRepository = DatabaseConnection.getRepository(UserEntity);
    const user = UserEntity.fromBody(userMetadata);
    const credential = CredentialEntity.fromBody(credentialMetadata);
    user.credentials = [credential];

    await userRepository.save(user);
    return user;
  }

  getPublic(): IUser {
    return {
      username: this.username,
      email: this.email
    };
  }

  getToken(): string {
    return createJWT(this.getPublic());
  }
}
