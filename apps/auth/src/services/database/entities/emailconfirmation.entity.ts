import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class EmailConfirmationEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  public user: UserEntity;

  @Column()
  public token: string;

  @Column()
  public issuedAt: Date;

  @Column()
  public validUntil: Date;
}