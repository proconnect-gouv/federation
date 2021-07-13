/* istanbul ignore file */

// Declarative code
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LoggerConfig } from '@fc/logger';
import { RabbitmqConfig } from '@fc/rabbitmq';
import { ElasticsearchConfig } from '@fc/elasticsearch';
import { MongooseConfig } from '@fc/mongoose';

export class CsmrTracksConfig {
  @IsObject()
  @ValidateNested()
  @Type(() => LoggerConfig)
  readonly Logger: LoggerConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => RabbitmqConfig)
  readonly TracksBroker: RabbitmqConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => ElasticsearchConfig)
  readonly Elasticsearch: ElasticsearchConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => MongooseConfig)
  readonly Mongoose: MongooseConfig;
}
