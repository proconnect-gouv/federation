import type { LoaderFunctionArgs } from 'react-router-dom';

import { ConfigService } from '@fc/config';

import { Options } from '../../../enums';
import type { PartnersConfig, VersionInterface } from '../../../interfaces';
import { AbstractService } from '../../abstract';

interface RouteParams {
  versionId: string;
}

export const read = async ({ params }: LoaderFunctionArgs) => {
  const { versionId } = params as unknown as RouteParams;
  const { endpoints } = ConfigService.get<PartnersConfig>(Options.CONFIG_NAME);
  const { instances } = endpoints;

  const url = `${instances}/${versionId}`;
  const data = await AbstractService.get<{ payload: VersionInterface }>(url);
  return data;
};
