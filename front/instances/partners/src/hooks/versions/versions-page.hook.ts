import { useLoaderData } from 'react-router-dom';

import type { InstanceInterface, ResponseInterface } from '@fc/core-partners';

export const useVersions = () => {
  const response = useLoaderData() as ResponseInterface<InstanceInterface[]>;
  const { payload } = response;

  const hasItems = !!(payload && payload.length);

  return { hasItems, items: payload };
};
