import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class FlowStepsSession {
  @IsString()
  @Expose()
  readonly previousRoute: string;
}
