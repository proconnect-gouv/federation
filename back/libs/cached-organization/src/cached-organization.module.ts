import { ApiEntrepriseModule } from "#libs/api-entreprise";
import { MongooseModule } from "#libs/mongoose";
import { Module } from "@nestjs/common";
import { CachedOrganizationSchema } from "./schemas";
import { CachedOrganizationService } from "./services";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "CachedOrganization", schema: CachedOrganizationSchema },
    ]),
    ApiEntrepriseModule,
  ],
  providers: [CachedOrganizationService],
  exports: [CachedOrganizationService],
})
export class CachedOrganizationModule {}
