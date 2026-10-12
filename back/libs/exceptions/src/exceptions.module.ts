import { ConfigModule } from "#libs/config";
import { LoggerModule } from "#libs/logger";
import { SessionModule } from "#libs/session";
import { Module } from "@nestjs/common";
import {
  BaseExceptionFilter,
  HttpExceptionFilter,
  UnknownExceptionFilter,
} from "./filters";

@Module({
  imports: [SessionModule, ConfigModule, LoggerModule],
  providers: [UnknownExceptionFilter, BaseExceptionFilter, HttpExceptionFilter],
})
export class ExceptionsModule {}
