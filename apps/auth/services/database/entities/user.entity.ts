import { IUser } from "common/user";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CredentialEntity } from "./credential.entity";

@Entity()
export class UserEntity implements IUser {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column()
    public username: string;

    @OneToMany(() => CredentialEntity, (credential) => credential.user)
    public credentials: CredentialEntity[]
}