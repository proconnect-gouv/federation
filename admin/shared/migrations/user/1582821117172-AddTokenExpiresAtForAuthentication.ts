import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenExpiresAtForAuthentication1582821117172
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "tokenExpiresAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tokenExpiresAt"`);
  }
}
