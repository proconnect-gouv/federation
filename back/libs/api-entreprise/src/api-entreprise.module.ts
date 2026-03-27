import { LoggerModule } from "@fc/logger";
import { Module } from "@nestjs/common";
import { ApiEntrepriseService } from "./services";
import { ApiEntrepriseClientService } from "./services/api-entreprise-client.service";

@Module({
  imports: [LoggerModule],
  providers: [ApiEntrepriseClientService, ApiEntrepriseService],
  exports: [ApiEntrepriseService],
})
export class ApiEntrepriseModule {}
