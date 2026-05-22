import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileStorage } from "../file-storage/file-storage.mongodb.entity";
import { FileStorageService } from "../file-storage/file-storage.service";
import { GristPublisherService } from "../grist-publisher/grist-publisher.service";
import { IdentityProviderModule } from "../identity-provider";
import { PaginationService } from "../pagination";
import { SecretManagerService } from "../utils/secret-manager.service";
import { SecretAdapter } from "../utils/secret.adapter";
import { ServiceProviderController } from "./service-provider.controller";
import { ServiceProviderFromDb } from "./service-provider.mongodb.entity";
import { ServiceProviderService } from "./service-provider.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceProviderFromDb, FileStorage], "fc-mongo"),
    IdentityProviderModule,
  ],
  controllers: [ServiceProviderController],
  providers: [
    PaginationService,
    ServiceProviderService,
    SecretManagerService,
    FileStorageService,
    SecretAdapter,
    GristPublisherService,
  ],
})
export class ServiceProviderModule {}
