import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaginationService } from "../pagination";
import { FederationUserController } from "./federation-user.controller";
import { FederationUser } from "./federation-user.mongodb.entity";
import { FederationUserService } from "./federation-user.service";

@Module({
  imports: [TypeOrmModule.forFeature([FederationUser], "fc-mongo")],
  controllers: [FederationUserController],
  providers: [FederationUserService, PaginationService],
  exports: [],
})
export class FederationUserModule {}
