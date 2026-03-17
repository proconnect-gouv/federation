import { CryptographyModule } from "@fc/cryptography";
import { MongooseModule } from "@fc/mongoose";
import { Module } from "@nestjs/common";
import { IdentityProviderAdapterMongoService } from "./identity-provider-adapter-mongo.service";
import { IdentityProviderSchema } from "./schemas";

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: "IdentityProvider", schema: IdentityProviderSchema },
    ]),
  ],
  providers: [IdentityProviderAdapterMongoService],
  exports: [IdentityProviderAdapterMongoService],
})
export class IdentityProviderAdapterMongoModule {}
