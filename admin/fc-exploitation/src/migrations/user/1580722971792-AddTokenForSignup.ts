import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenForSignup1580722971792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "user" ADD "token" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "tokenCreatedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tokenCreatedAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "token"`);
  }
}
