import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

export enum CredentialType {
    PASSWORD,
    GOOGLE,
    GITHUB
}

@Entity()
@Index(["user", "credentialType"], { unique: true })
export class CredentialEntity {
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
}