import { ClassTransformOptions } from 'class-transformer';
import { ValidationError, ValidatorOptions } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { FeatureHandler, IFeatureHandler } from '@fc/feature-handler';
import { validateDto } from '@fc/common';
import { LoggerService } from '@fc/logger';
import { OidcIdentityDto } from '../../dto';
@Injectable()
@FeatureHandler('core-fcp-default-identity-check')
export class CoreFcpDefaultIdentityCheckHandler
  implements IFeatureHandler<ValidationError[]> {
  constructor(public readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  async handle(identity: Partial<OidcIdentityDto>): Promise<ValidationError[]> {
    this.logger.debug('Identity Check: ##### core-fcp-default-identity-check');
    const validatorOptions: ValidatorOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    };
    const transformOptions: ClassTransformOptions = {
      excludeExtraneousValues: true,
    };
    const errors = await validateDto(
      identity,
      OidcIdentityDto,
      validatorOptions,
      transformOptions,
    );

    return errors;
  }
}
