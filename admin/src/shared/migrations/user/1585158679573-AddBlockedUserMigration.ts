import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlockedUserMigration1585158679573
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TYPE "user_roles_enum" RENAME TO "user_roles_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_roles_enum" AS ENUM('admin', 'operator', 'security', 'new_account', 'inactive_admin', 'inactive_operator', 'inactive_security', 'blocked_user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "roles" TYPE "user_roles_enum"[] USING "roles"::"text"::"user_roles_enum"[]`,
    );
    await queryRunner.query(`DROP TYPE "user_roles_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "user_roles_enum_old" AS ENUM('admin', 'operator', 'security', 'new_account', 'inactive_admin', 'inactive_operator', 'inactive_security')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "roles" TYPE "user_roles_enum_old"[] USING "roles"::"text"::"user_roles_enum_old"[]`,
    );
    await queryRunner.query(`DROP TYPE "user_roles_enum"`);
    await queryRunner.query(
      `ALTER TYPE "user_roles_enum_old" RENAME TO  "_user_roles_enum"`,
    );
  }
}
