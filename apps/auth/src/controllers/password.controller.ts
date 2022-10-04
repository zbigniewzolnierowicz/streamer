import { Request, Response } from "express";
import { DataSource } from "typeorm";
import { LogInUserDTO } from "../dto/loginuser.dto";
import { NewUserPasswordDTO } from "../dto/newuserpassword.dto";
import { PasswordAuthService } from "../services/auth/password.auth";
import config from "../services/config";
import { UserEntity } from "../services/database/entities/user.entity";

export class PasswordController {
  private passwordAuth: PasswordAuthService;

  constructor(private db: DataSource) {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.confirm = this.confirm.bind(this);
    this.passwordAuth = new PasswordAuthService(this.db);
  }

  async login(req: Request, res: Response) {
    const body = req.body;
    const loginUserDTO = new LogInUserDTO();
    Object.assign(loginUserDTO, body);

    let loggedInUser: UserEntity;
    try {
      loggedInUser = await this.passwordAuth.login(loginUserDTO);
    } catch (e) {
      // TODO: Add advanced error handling
      return res.json({
        message: "User login error.",
        error: (e as Error).message
      });
    }

    return res.json({
      access_token: loggedInUser.getToken()
    });
  }

  async register(req: Request, res: Response) {
    const body = req.body;
    const newUserDTO = new NewUserPasswordDTO();
    Object.assign(newUserDTO, body);

    let token: string;
    try {
      token = await this.passwordAuth.register(newUserDTO);
    } catch (e) {
      // TODO: Add advanced error handling
      return res.json({
        message: "User creation error.",
        error: (e as Error).message
      });
    }

    const confirmUrl = config.auth.password.basePath + `/confirm?token=${token}`;

    return res.json({
      message: confirmUrl
    });
  }

  async confirm(req: Request<{ token: string }>, res: Response) {
    const token = req.query.token as string;
    try {
      const result = await this.passwordAuth.confirmUser(token);
      if (!result) {
        throw new Error("For some reason the user is still inactive.");
      }

      return res.json({
        message: "The user was activated."
      });
    } catch (e) {
      return res.json({
        message: "User confirmation error.",
        error: (e as Error).message
      });
    }
  }
}