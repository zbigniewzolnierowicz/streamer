import { IUser } from "common/user";

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