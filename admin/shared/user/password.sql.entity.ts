import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './roles.enum';

@Entity()
export class Password {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  updatedAt: Date;
}
