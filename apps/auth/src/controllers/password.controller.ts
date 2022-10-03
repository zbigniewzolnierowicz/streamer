import { validate } from "class-validator";
import { Request, Response } from "express";
import { DataSource } from "typeorm";
import { NewUserPasswordDTO } from "../dto/newuserpassword.dto";
import { UserEntity } from "../services/database/entities/user.entity";
import { CredentialType } from "../types";
import argon2 from "argon2";

export class PasswordController {
  constructor(private db: DataSource) {
    this.register = this.register.bind(this);
  }

  async login(req: Request, res: Response) {
    // TODO: Add login endpoint logic
    return res.json({ message: "Logging in is not implemented yet." });
  }

  async register(req: Request, res: Response) {
    const userRepository = this.db.getRepository(UserEntity);

    const body = req.body;
    const newUserDTO = new NewUserPasswordDTO();
    Object.assign(newUserDTO, body);

    const errors = await validate(newUserDTO);
    if (errors.length > 0) {
      return res.json({
        message: "Validation error.",
        errors: errors
      });
    }

    const overlappingUserCount = await userRepository.count({ where: [{ email: newUserDTO.email }, { username: newUserDTO.username }] });
    if (overlappingUserCount > 0) {
      return res.json({
        message: "User already exists."
      });
    }

    const _user = await UserEntity.createNewUser({
      username: newUserDTO.username,
      email: newUserDTO.email
    }, {
      credentialType: CredentialType.PASSWORD,
      credentialToken: await argon2.hash(newUserDTO.password)
    });

    // TODO: Add email confirmation

    return res.json({
      message: "User created."
    });
  }
}