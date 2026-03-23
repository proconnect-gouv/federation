import { Module } from "@nestjs/common";
import { ApiEntrepriseService } from "./services";
import { ApiEntrepriseClientProvider } from "./services/api-entreprise-client.provider";

@Module({
  imports: [],
  providers: [ApiEntrepriseClientProvider, ApiEntrepriseService],
  exports: [ApiEntrepriseService],
})
export class ApiEntrepriseModule {}
