import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '@fc/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('Postgres'),
      inject: [ConfigService],
    }),
  ],
})
export class PostgresModule {}
