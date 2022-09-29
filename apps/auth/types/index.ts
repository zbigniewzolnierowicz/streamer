import { IUser } from "common/user";
import { JwtPayload } from "jsonwebtoken";

export interface IUserLocals {
  user: IUser
}

export enum CredentialType {
  PASSWORD,
  GOOGLE,
  GITHUB
}

export interface ICredential {
  credentialType: CredentialType
  credentialToken: string
}

export interface ICustomJwtPayload extends JwtPayload, IUser {}