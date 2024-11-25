import { render } from '@testing-library/react';

import { type InstanceInterface, VersionsListComponent } from '@fc/core-partners';
import { TileComponent } from '@fc/dsfr';
import { t } from '@fc/i18n';

import { useVersions } from '../../../hooks';
import { CreateButton } from '../../components';
import { VersionsPage } from './versions.page';

jest.mock('../../components/buttons/create/create.button');
jest.mock('../../../hooks/versions/versions-page.hook');

describe('VersionsPage', () => {
  it('should match snapshot, when items are empties', () => {
    // Given
    jest.mocked(useVersions).mockReturnValueOnce({
      hasItems: false,
      items: [],
    });
    jest
      .mocked(t)
      .mockReturnValueOnce('any-sandbox_title')
      .mockReturnValueOnce('any-create_tile_desc')
      .mockReturnValueOnce('any-create_tile_title')
      .mockReturnValueOnce('any-sandbox_tile_desc')
      .mockReturnValueOnce('any-sandbox_tile_title');

    // When
    const { container, getByText } = render(<VersionsPage />);
    const titleElt = getByText('any-sandbox_title');

    // Then
    expect(container).toMatchSnapshot();
    expect(t).toHaveBeenCalledTimes(5);
    expect(t).toHaveBeenNthCalledWith(1, 'Partners.homepage.sandbox_title');
    expect(t).toHaveBeenNthCalledWith(2, 'Partners.homepage.create_tile_desc');
    expect(t).toHaveBeenNthCalledWith(3, 'Partners.homepage.create_tile_title');
    expect(t).toHaveBeenNthCalledWith(4, 'Partners.homepage.sandbox_tile_desc');
    expect(t).toHaveBeenNthCalledWith(5, 'Partners.homepage.sandbox_tile_title');
    expect(titleElt).toBeInTheDocument();
    expect(TileComponent).toHaveBeenCalledTimes(2);
    expect(TileComponent).toHaveBeenNthCalledWith(
      1,
      {
        description: 'any-create_tile_desc',
        isHorizontal: true,
        link: 'create',
        size: 'lg',
        title: 'any-create_tile_title',
      },
      {},
    );
    expect(TileComponent).toHaveBeenNthCalledWith(
      2,
      {
        description: 'any-sandbox_tile_desc',
        isHorizontal: true,
        link: '.',
        size: 'lg',
        title: 'any-sandbox_tile_title',
      },
      {},
    );
  });

  it('should match snapshot, when items are not empties', () => {
    // Given
    const itemsMock = Symbol('any-items-list') as unknown as InstanceInterface[];
    jest.mocked(useVersions).mockReturnValueOnce({
      hasItems: true,
      items: itemsMock,
    });
    jest
      .mocked(t)
      .mockReturnValueOnce('any-sandbox_title')
      .mockReturnValueOnce('any-sandbox_tile_desc')
      .mockReturnValueOnce('any-sandbox_tile_title');

    // When
    const { container, getByText } = render(<VersionsPage />);
    const titleElt = getByText('any-sandbox_title');

    // Then
    expect(container).toMatchSnapshot();
    expect(t).toHaveBeenCalledTimes(3);
    expect(t).toHaveBeenNthCalledWith(1, 'Partners.homepage.sandbox_title');
    expect(t).toHaveBeenNthCalledWith(2, 'Partners.homepage.sandbox_tile_desc');
    expect(t).toHaveBeenNthCalledWith(3, 'Partners.homepage.sandbox_tile_title');
    expect(titleElt).toBeInTheDocument();
    expect(CreateButton).toHaveBeenCalledOnce();
    expect(CreateButton).toHaveBeenCalledWith({}, {});
    expect(VersionsListComponent).toHaveBeenCalledOnce();
    expect(VersionsListComponent).toHaveBeenCalledWith({ items: itemsMock }, {});
    expect(TileComponent).toHaveBeenCalledOnce();
    expect(TileComponent).toHaveBeenCalledWith(
      {
        description: 'any-sandbox_tile_desc',
        isHorizontal: true,
        link: '.',
        size: 'lg',
        title: 'any-sandbox_tile_title',
      },
      {},
    );
  });
});
