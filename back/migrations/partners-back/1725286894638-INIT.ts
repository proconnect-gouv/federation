import { MigrationInterface, QueryRunner } from 'typeorm';

export class INIT1725286894638 implements MigrationInterface {
  name = 'INIT1725286894638';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "partners_organisation" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_811562b8b7f6e91891e17c36906" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "partners_platform" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" text NOT NULL,
        CONSTRAINT "UQ_54a4d9273f48f650fdd1f4af9ef" UNIQUE ("name"),
        CONSTRAINT "PK_c880748d93504720b995f1ab82f" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "partners_service_provider" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" text NOT NULL, 
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "platformId" uuid NOT NULL,
        "organisationId" uuid NOT NULL,
        CONSTRAINT "PK_1095af4f0e1acd71db672a69200" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."partners_service_provider_instance_version_publicationstatus_enum" AS ENUM('DRAFT', 'PENDING', 'PUBLISHED')`,
    );

    await queryRunner.query(
      `CREATE TABLE "partners_service_provider_instance_version" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "publicationStatus" "public"."partners_service_provider_instance_version_publicationstatus_enum" NOT NULL DEFAULT 'DRAFT',
        "data" json NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "instanceId" uuid NOT NULL,
       CONSTRAINT "PK_37da5fb88529eb780b5fb421ff6" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."partners_service_provider_instance_environment_enum" AS ENUM(
        'SANDBOX',
        'PRODUCTION'
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "partners_service_provider_instance" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" text NOT NULL,
        "environment" "public"."partners_service_provider_instance_environment_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_dea35a5e7b2fca169534896b135" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "partners_account" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sub" uuid NOT NULL,
        "email" text NOT NULL,
        "firstname" text NOT NULL,
        "lastname" text NOT NULL,
        "siren" character(9),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_36d9992afb60e3f1957dc3637c3" UNIQUE ("sub"),
        CONSTRAINT "UQ_34a99e0be01a3d99e364a442bc5" UNIQUE ("email"),
        CONSTRAINT "PK_214cfac1bcddb21b46983a19ff0" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."partners__account_permission_entity_enum" AS ENUM(
        'ORGANISATION',
        'SERVICE_PROVIDER',
        'SP_INSTANCE',
        'SP_INSTANCE_VERSION'
      )`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."partners__account_permission_permissiontype_enum" AS ENUM(
        'LIST',
        'CREATE',
        'VIEW',
        'EDIT'
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "partners_account_permission" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "entityId" uuid,
        "entity" "public"."partners__account_permission_entity_enum" DEFAULT 'SERVICE_PROVIDER',
        "permissionType" "public"."partners__account_permission_permissiontype_enum" NOT NULL DEFAULT 'LIST',
        "accountId" uuid NOT NULL,
        CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "partners_account_permission" ADD CONSTRAINT "FK_4fa07bd346497e80b3e8623ea88" FOREIGN KEY ("accountId") REFERENCES "partners_account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_service_provider" ADD CONSTRAINT "FK_7b5edd788d8c7a065422e7747ed" FOREIGN KEY ("platformId") REFERENCES "partners_platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_service_provider" ADD CONSTRAINT "FK_665903a0eea717558d5d3edef9d" FOREIGN KEY ("organisationId") REFERENCES "partners_organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_service_provider_instance_version" ADD CONSTRAINT "FK_aa0b5c4f38594f2092508f635e8" FOREIGN KEY ("instanceId") REFERENCES "partners_service_provider_instance"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partners_service_provider_instance_version" DROP CONSTRAINT "FK_aa0b5c4f38594f2092508f635e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_service_provider" DROP CONSTRAINT "FK_665903a0eea717558d5d3edef9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_service_provider" DROP CONSTRAINT "FK_7b5edd788d8c7a065422e7747ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_account_permission" DROP CONSTRAINT "FK_4fa07bd346497e80b3e8623ea88"`,
    );
    await queryRunner.query(`DROP TABLE "partners_account_permission"`);
    await queryRunner.query(
      `DROP TYPE "public"."partners__account_permission_entity_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."partners__account_permission_permissiontype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "partners_account"`);
    await queryRunner.query(`DROP TABLE "partners_service_provider_instance"`);
    await queryRunner.query(
      `DROP TYPE "public"."partners_service_provider_instance_environment_enum"`,
    );
    await queryRunner.query(
      `DROP TABLE "partners_service_provider_instance_version"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."partners_service_provider_instance_version_publicationstatus_enum"`,
    );
    await queryRunner.query(`DROP TABLE "partners_service_provider"`);
    await queryRunner.query(`DROP TABLE "partners_platform"`);
    await queryRunner.query(`DROP TABLE "partners_organisation"`);
  }
}
