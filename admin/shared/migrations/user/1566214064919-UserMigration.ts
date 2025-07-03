import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMigration1566214064919 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "user_roles_enum" AS ENUM('admin', 'operator', 'new_account', 'inactive_admin', 'inactive_operator')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "username" character varying NOT NULL,
      "email" character varying NOT NULL,
      "roles" "user_roles_enum" array NOT NULL,
      "passwordHash" character varying,
      "secret" character varying,
      CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
      CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "user_roles_enum"`);
  }
}
