/* istanbul ignore file */

// Declarative code
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScopesController } from "./scopes.controller";
import { Scopes } from "./scopes.mongodb.entity";
import { ScopesService } from "./scopes.service";

@Module({
  imports: [TypeOrmModule.forFeature([Scopes], "fc-mongo")],
  controllers: [ScopesController],
  providers: [ScopesService],
  exports: [ScopesService],
})
export class ScopesModule {}
