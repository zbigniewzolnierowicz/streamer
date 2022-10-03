import { IUser } from "common/user";
import { JwtPayload } from "jsonwebtoken";

export interface IUserLocals {
  user: IUser
}

export enum CredentialType {
  PASSWORD = "password",
  GOOGLE = "google",
  GITHUB = "github"
}

export interface ICredential {
  credentialType: CredentialType
  credentialToken: string
}

export interface ICustomJwtPayload extends JwtPayload, IUser {}