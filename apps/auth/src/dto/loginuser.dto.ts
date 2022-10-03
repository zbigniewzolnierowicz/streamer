import { IsNotEmpty, Length } from "class-validator";

export class LogInUserDTO {
  @IsNotEmpty()
  @Length(3, 20)
  public username: string;

  @IsNotEmpty()
  public password: string;
}