import { ValidationError, ValidatorOptions } from 'class-validator';
import { ClassTransformOptions } from 'class-transformer';
import { IFeatureHandler, FeatureHandler } from '@fc/feature-handler';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { validateDto } from '@fc/common';
import { EidasIdentityDto } from '../../dto';

@Injectable()
@FeatureHandler('core-fcp-eidas-identity-check')
export class CoreFcpEidasIdentityCheckHandler
  implements IFeatureHandler<ValidationError[]> {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * The arguments sent to all FeatureHandler's handle() methods must be
   * typed by a interface exteded from `IFeatureHandler`
   * @see IVerifyFeatureHandlerHandleArgument as an exemple.
   * @todo #FC-487
   * @author Hugues
   * @date 2021-16-04
   */
  async handle(
    identity: Partial<EidasIdentityDto>,
  ): Promise<ValidationError[]> {
    this.logger.debug('Identity Check: ##### core-fcp-eidas-identity-check');
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
      EidasIdentityDto,
      validatorOptions,
      transformOptions,
    );

    return errors;
  }
}
