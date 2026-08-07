import { ConfigModule } from "@fc/config";
import { LoggerModule } from "@fc/logger";
import { SessionModule } from "@fc/session";
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
