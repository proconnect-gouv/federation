import { CryptographyModule, CryptographyService } from "#libs/cryptography";
import { SessionModule } from "#libs/session";
import { Global, Module } from "@nestjs/common";
import { CsrfService } from "./services";

@Global()
@Module({
  imports: [CryptographyModule, SessionModule],
  providers: [CsrfService, CryptographyService],
  exports: [CsrfService, CryptographyService],
})
export class CsrfModule {}
