import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

/**
 * Options for NestJs's RabbitMQ module
 * @see https://docs.nestjs.com/microservices/rabbitmq#options
 */
export class RabbitmqConfig {
  @IsArray()
  // @IsUrl()
  readonly urls: string[];

  @IsString()
  readonly queue: string;

  /**
   * @TODO Validate options (hard coded)
   */
  @IsOptional()
  readonly queueOptions?: object;

  /**
   * @TODO Configure others available options
   * @see https://docs.nestjs.com/microservices/rabbitmq#options
   * @IsNumber()
   * @Type(() => Number)
   *  prefetchCount: number;
   *
   *  @IsBoolean()
   *  readonly noAck: boolean;
   *
   *  @ValidateNested()
   *  @Type(() => SocketOptions)
   *  readonly socketOptions: object;
   */

  /**
   * Custom properties
   */
  @IsIn([
    'ascii',
    'utf8',
    'utf-8',
    'utf16le',
    'ucs2',
    'ucs-2',
    'base64',
    'latin1',
    'binary',
    'hex',
  ])
  @IsString()
  readonly payloadEncoding: BufferEncoding;
}
