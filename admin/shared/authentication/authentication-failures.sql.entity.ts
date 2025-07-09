import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('authentication_failures')
export class AuthenticationFailures {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  token?: string;

  @Column()
  authenticationAttemptedAt: Date;
}
