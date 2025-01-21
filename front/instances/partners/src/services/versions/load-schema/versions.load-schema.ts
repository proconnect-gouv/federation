import { ConfigService } from '@fc/config';
import { Options, type PartnersConfig, PartnersService } from '@fc/core-partners';
import type { JSONFieldType } from '@fc/dto2form';

export const loadSchema = async () => {
  const { schemas } = ConfigService.get<PartnersConfig>(Options.CONFIG_NAME);
  const { versions } = schemas;

  const data = await PartnersService.get<JSONFieldType[]>(versions);
  return data;
};
