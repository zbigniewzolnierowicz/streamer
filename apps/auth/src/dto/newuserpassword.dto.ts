import { IsEmail, IsNotEmpty, Length } from "class-validator";
import { IUser } from "common/user";

export class NewUserPasswordDTO implements IUser {
  @IsNotEmpty()
  @Length(3, 20)
  public username: string;

  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  public password: string;
}