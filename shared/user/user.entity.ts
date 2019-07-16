import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
  })
  roles: UserRole[];

  @Column({ nullable: true })
  passwordHash: string | undefined;
}
