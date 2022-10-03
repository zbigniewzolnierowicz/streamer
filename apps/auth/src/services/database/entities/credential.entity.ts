import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CredentialType, ICredential } from "../../../types";
import { UserEntity } from "./user.entity";

@Entity()
@Index(["user", "credentialType"], { unique: true })
export class CredentialEntity implements ICredential {
    @PrimaryGeneratedColumn("uuid")
  public id: string;

    @Column({
      type: "enum",
      enum: CredentialType,
      default: CredentialType.PASSWORD
    })
    public credentialType: CredentialType;

    @Column()
    public credentialToken: string;

    @ManyToOne(() => UserEntity, (user) => user.credentials)
    public user: UserEntity;

    static fromBody(metadata: ICredential): CredentialEntity {
      const newCredential = new CredentialEntity();
      Object.assign(newCredential, metadata);

      return newCredential;
    }
}