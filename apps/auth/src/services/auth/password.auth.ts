import { validate } from "class-validator";
import { DataSource } from "typeorm";
import argon2 from "argon2";
import { NewUserPasswordDTO } from "../../dto/newuserpassword.dto";
import { CredentialType } from "../../types";
import { UserEntity } from "../database/entities/user.entity";
import { LogInUserDTO } from "../../dto/loginuser.dto";
import { EmailConfirmationEntity } from "../database/entities/emailconfirmation.entity";
import { randomString } from "../../utils/random";
import { addMinutes } from "date-fns";

export class PasswordAuthService {
  constructor(private db: DataSource) {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.confirmUser = this.confirmUser.bind(this);
  }

  async login(loginUserDTO: LogInUserDTO) {
    const userRepository = this.db.getRepository(UserEntity);

    const errors = await validate(loginUserDTO);
    if (errors.length > 0) {
      throw new Error("Validation error");
    }

    const existingUser = await userRepository.findOne({ where: { username: loginUserDTO.username, credentials: { credentialType: CredentialType.PASSWORD } }, relations: { credentials: true } });

    if (!existingUser) {
      // TODO: Replace login errors with a proper error
      throw new Error("User does not exist.");
    }

    const passwordCredential = existingUser.credentials.find(cred => (cred.credentialType as CredentialType) === CredentialType.PASSWORD);

    if (!passwordCredential) {
      /*
        TODO: Implement the mechanism for adding new auth strategies onto existing accounts
        Maybe not for password login though. Or yes. Whatever.
      */
      throw new Error("User did not log in with a password.");
    }

    const passwordValid = await argon2.verify(passwordCredential.credentialToken, loginUserDTO.password);

    if (!passwordValid) {
      throw new Error("Bad password!");
    }

    if (!existingUser.active) {
      throw new Error("User is not active.");
    }

    return existingUser;
  }

  async register(newUserDTO: NewUserPasswordDTO) {
    const userRepository = this.db.getRepository(UserEntity);
    const confirmEmailRepository = this.db.getRepository(EmailConfirmationEntity);

    const errors = await validate(newUserDTO);
    if (errors.length > 0) {
      throw new Error("Validation error");
    }

    const overlappingUserCount = await userRepository.count({ where: [{ email: newUserDTO.email }, { username: newUserDTO.username }] });
    if (overlappingUserCount > 0) {
      throw new Error("User already exists");
    }

    const user = await UserEntity.createNewUser({
      username: newUserDTO.username,
      email: newUserDTO.email
    }, {
      credentialType: CredentialType.PASSWORD,
      credentialToken: await argon2.hash(newUserDTO.password)
    });

    const confirmationEmail = new EmailConfirmationEntity();
    confirmationEmail.user = user;
    confirmationEmail.token = randomString(128);
    confirmationEmail.issuedAt = new Date();
    confirmationEmail.validUntil = addMinutes(confirmationEmail.issuedAt, 15);

    const { token } = await confirmEmailRepository.save(confirmationEmail);

    return token;
  }

  async confirmUser(token: string) {
    const confirmEmailRepository = this.db.getRepository(EmailConfirmationEntity);
    const userRepository = this.db.getRepository(UserEntity);

    const possibleToken = await confirmEmailRepository.findOne({ where: { token }, relations: { user: true } });

    if (!possibleToken) {
      throw new Error("No such token was stored.");
    }

    const user = possibleToken.user;
    user.active = true;

    const savedUser = await userRepository.save(user);
    await confirmEmailRepository.delete({ id: possibleToken.id });

    return savedUser.active;
  }
}