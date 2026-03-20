import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import crypto from "crypto";
import { GristPublisherService } from "../grist-publisher/grist-publisher.service";
import { PaginationService } from "../pagination";
import { SecretManagerService } from "../utils/secret-manager.service";
import { IdentityProviderController } from "./identity-provider.controller";
import { IdentityProviderFromDb } from "./identity-provider.mongodb.entity";
import { IdentityProviderService } from "./identity-provider.service";

const cryptoProvider = {
  provide: "cryptoProvider",
  useValue: crypto,
};

@Module({
  imports: [TypeOrmModule.forFeature([IdentityProviderFromDb], "fc-mongo")],
  controllers: [IdentityProviderController],
  providers: [
    IdentityProviderService,
    SecretManagerService,
    cryptoProvider,
    PaginationService,
    GristPublisherService,
  ],
  exports: [IdentityProviderService],
})
export class IdentityProviderModule {}
