import { render } from '@testing-library/react';

import type { EventTypes } from '@fc/common';
import { type InstanceInterface, VersionsListComponent } from '@fc/core-partners';
import { AlertComponentV2, TileComponent } from '@fc/dsfr';
import { t } from '@fc/i18n';

import type { SubmitTypesMessage } from '../../../enums';
import { useVersions } from '../../../hooks';
import { CreateButton } from '../../components';
import { VersionsPage } from './versions.page';

jest.mock('../../components/buttons/create/create.button');
jest.mock('../../../hooks/versions/versions-page.hook');

describe('VersionsPage', () => {
  // Given
  const closeAlertHandlerMock = jest.fn();

  beforeEach(() => {
    // Given
    jest.mocked(useVersions).mockReturnValue({
      closeAlertHandler: closeAlertHandlerMock,
      hasItems: false,
      items: [],
      submitState: undefined,
    });
  });

  it('should match snapshot, when items are empties', () => {
    // Given
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
    expect(t).toHaveBeenNthCalledWith(1, 'Partners.homepage.sandboxTitle');
    expect(t).toHaveBeenNthCalledWith(2, 'Partners.homepage.createTileDescription');
    expect(t).toHaveBeenNthCalledWith(3, 'Partners.homepage.createTileTitle');
    expect(t).toHaveBeenNthCalledWith(4, 'Partners.homepage.sandboxTileDescription');
    expect(t).toHaveBeenNthCalledWith(5, 'Partners.homepage.sandboxTileTitle');
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
      closeAlertHandler: closeAlertHandlerMock,
      hasItems: true,
      items: itemsMock,
      submitState: undefined,
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
    expect(t).toHaveBeenNthCalledWith(1, 'Partners.homepage.sandboxTitle');
    expect(t).toHaveBeenNthCalledWith(2, 'Partners.homepage.sandboxTileDescription');
    expect(t).toHaveBeenNthCalledWith(3, 'Partners.homepage.sandboxTileTitle');
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

  it('should match snapshot, when the alert component is displayed', () => {
    // Given
    const itemsMock = Symbol('any-items-list') as unknown as InstanceInterface[];
    const submitStateMock = {
      message: 'any-submit-i18n-message-mock' as SubmitTypesMessage,
      type: 'any-submit-type-mock' as EventTypes.ERROR,
    };
    jest.mocked(t).mockReturnValueOnce('any').mockReturnValueOnce('any-submit-message-mock');
    jest.mocked(useVersions).mockReturnValueOnce({
      closeAlertHandler: closeAlertHandlerMock,
      hasItems: true,
      items: itemsMock,
      submitState: submitStateMock,
    });

    // When
    const { container } = render(<VersionsPage />);

    // Then
    expect(t).toHaveBeenNthCalledWith(2, 'any-submit-i18n-message-mock');
    expect(container).toMatchSnapshot();
    expect(AlertComponentV2).toHaveBeenCalledOnce();
    expect(AlertComponentV2).toHaveBeenCalledWith(
      {
        onClose: closeAlertHandlerMock,
        title: 'any-submit-message-mock',
        type: 'any-submit-type-mock',
      },
      {},
    );
  });
});
