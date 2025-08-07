import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthenticationFailuresMigration1585297442338
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "authentication_failures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "token" character varying, "authenticationAttemptedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_684fcb9924c8502d64b129cc8b1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "authentication_failures"`);
  }
}
