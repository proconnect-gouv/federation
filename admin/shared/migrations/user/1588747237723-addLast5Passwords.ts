import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLast5Passwords1588747237723 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "password" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "passwordHash" character varying NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_cbeb55948781be9257f44febfa0" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "password"`);
  }
}
