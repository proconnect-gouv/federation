import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Password {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  updatedAt: Date;
}
