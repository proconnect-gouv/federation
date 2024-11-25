import { render } from '@testing-library/react';

import type { ISODate } from '@fc/common';

import type { Environment } from '../../enums';
import { VersionComponent } from '../version/version.component';
import { VersionsListComponent } from './versions.list';

jest.mock('../version/version.component');

describe('VersionsListComponent', () => {
  // Given
  const itemsMock = [
    {
      createdAt: 'any-createdAt-mock-1' as unknown as ISODate,
      environment: 'SANDBOX' as unknown as Environment,
      id: '1',
      name: 'name',
      updatedAt: 'any-updatedAt-mock-1' as unknown as ISODate,
      versions: [expect.any(Object), expect.any(Object), expect.any(Object)],
    },
    {
      createdAt: 'any-createdAt-mock-2' as unknown as ISODate,
      environment: 'SANDBOX' as unknown as Environment,
      id: '2',
      name: 'name',
      updatedAt: 'any-updatedAt-mock-2' as unknown as ISODate,
      versions: [expect.any(Object), expect.any(Object), expect.any(Object)],
    },
    {
      createdAt: 'any-createdAt-mock-3' as unknown as ISODate,
      environment: 'SANDBOX' as unknown as Environment,
      id: '3',
      name: 'name',
      updatedAt: 'any-updatedAt-mock-3' as unknown as ISODate,
      versions: [expect.any(Object), expect.any(Object), expect.any(Object)],
    },
  ];

  it('should match snapshot', () => {
    // When
    const { container } = render(<VersionsListComponent items={itemsMock} />);

    // Then
    expect(container).toMatchSnapshot();
    expect(VersionComponent).toHaveBeenCalledTimes(3);
    expect(VersionComponent).toHaveBeenNthCalledWith(1, { item: itemsMock[0] }, {});
    expect(VersionComponent).toHaveBeenNthCalledWith(2, { item: itemsMock[1] }, {});
    expect(VersionComponent).toHaveBeenNthCalledWith(3, { item: itemsMock[2] }, {});
  });
});
