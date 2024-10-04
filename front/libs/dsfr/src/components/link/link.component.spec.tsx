import { render } from '@testing-library/react';
import { Link } from 'react-router-dom';

import { IconPlacement } from '../../enums';
import { LinkComponent } from './link.component';

describe('LinkComponent', () => {
  it('should match the snapshot, with default props', () => {
    // when
    const { container } = render(<LinkComponent href="any-url-mock">any-label-mock</LinkComponent>);

    // then
    expect(container).toMatchSnapshot();
    expect(Link).toHaveBeenCalledOnce();
    expect(Link).toHaveBeenCalledWith(
      {
        children: 'any-label-mock',
        className: 'fr-link fr-link--md',
        reloadDocument: false,
        to: 'any-url-mock',
      },
      {},
    );
  });

  it('should match the snapshot, with all props', () => {
    // when
    const { container } = render(
      <LinkComponent
        external
        href="any-url-mock"
        icon="any-icon-mock"
        iconPlacement={IconPlacement.RIGHT}>
        any-label-mock
      </LinkComponent>,
    );

    // then
    expect(container).toMatchSnapshot();
    expect(Link).toHaveBeenCalledOnce();
    expect(Link).toHaveBeenCalledWith(
      {
        children: 'any-label-mock',
        className: 'fr-link fr-link--md fr-icon-any-icon-mock fr-link--icon-right',
        reloadDocument: true,
        to: 'any-url-mock',
      },
      {},
    );
  });
});
