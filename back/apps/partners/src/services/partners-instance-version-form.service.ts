import { Injectable } from '@nestjs/common';

import { PartnersServiceProviderInstance } from '@entities/typeorm';

import { getTransformed } from '@fc/common';
import { ConfigService } from '@fc/config';
import { ServiceProviderInstanceVersionDto } from '@fc/partners-service-provider-instance-version';
import { OidcClientInterface } from '@fc/service-provider';

import { DefaultServiceProviderLowValueConfig } from '../dto';

@Injectable()
export class PartnersInstanceVersionFormService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Get a full OidcClientInterface from the posted values.
   * Default or private values are set in the returned object
   */
  fromFormValues(values: Partial<OidcClientInterface>): OidcClientInterface {
    const DefaultServiceProviderLowValue =
      this.config.get<DefaultServiceProviderLowValueConfig>(
        'DefaultServiceProviderLowValue',
      );

    const output = {
      ...DefaultServiceProviderLowValue,
      ...(values as OidcClientInterface),
    };

    return output;
  }

  /**
   * Get an object with only relevants values for the form.
   * Private values are removed from the returned object
   */
  toFormValues(
    instance: PartnersServiceProviderInstance,
  ): PartnersServiceProviderInstance {
    return {
      ...instance,
      versions: instance.versions.map((version) => {
        version.data = getTransformed<Record<string, unknown>>(
          version.data,
          ServiceProviderInstanceVersionDto,
          { excludeExtraneousValues: true },
        );

        return version;
      }),
    };
  }
}
