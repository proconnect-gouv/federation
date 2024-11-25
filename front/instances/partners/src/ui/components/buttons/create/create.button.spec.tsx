import { render } from '@testing-library/react';

import { LinkButton } from '@fc/dsfr';
import { t } from '@fc/i18n';

import { CreateButton } from './create.button';

describe('CreateButton', () => {
  it('should match the snapshot', () => {
    // Given
    jest.mocked(t).mockReturnValueOnce('any-i18n-mock');

    // When
    const { container } = render(<CreateButton />);

    // Then
    expect(container).toMatchSnapshot();
    expect(LinkButton).toHaveBeenCalledOnce();
    expect(LinkButton).toHaveBeenCalledWith(
      {
        children: 'any-i18n-mock',
        icon: 'add-line',
        iconPlacement: 'left',
        link: 'create',
        noOutline: true,
        priority: 'tertiary',
      },
      {},
    );
    expect(t).toHaveBeenCalledOnce();
    expect(t).toHaveBeenCalledWith('Partners.button.create_instance');
  });
});
