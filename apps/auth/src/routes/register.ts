import { validate } from "class-validator";
import { Router, Request, Response } from "express";
import { NewUserPasswordDTO } from "../dto/newuserpassword.dto";
import { DatabaseConnection } from "../services/database";
import { UserEntity } from "../services/database/entities/user.entity";
import { CredentialType } from "../types";
import argon2 from "argon2";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const userRepository = DatabaseConnection.getRepository(UserEntity);

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
});

export {
  router
};