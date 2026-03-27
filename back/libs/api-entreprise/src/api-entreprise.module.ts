import { LoggerModule } from "@fc/logger";
import { Module } from "@nestjs/common";
import { ApiEntrepriseService } from "./services";
import { ApiEntrepriseClientProvider } from "./services/api-entreprise-client.provider";

@Module({
  imports: [LoggerModule],
  providers: [ApiEntrepriseClientProvider, ApiEntrepriseService],
  exports: [ApiEntrepriseService],
})
export class ApiEntrepriseModule {}
