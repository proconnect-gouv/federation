import { render } from '@testing-library/react';
import { Link } from 'react-router-dom';

import { HeadingTag } from '@fc/common';

import { CardBackgrounds, Sizes } from '../../enums';
import { BadgesGroupComponent } from '../badges-group';
import { CardComponent } from './card.component';
import { CardDetailComponent } from './detail';
import { CardMediaComponent } from './media';

jest.mock('./media/card.media');
jest.mock('./detail/card.detail');
jest.mock('../badges-group/badges-group.component');

describe('CardComponent', () => {
  it('should match the snapshot, with default values', () => {
    // when
    const { container } = render(
      <CardComponent title="Card title mock">any description text treat as children</CardComponent>,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, with all optionnal values', () => {
    // when
    const { container } = render(
      <CardComponent
        enlargeLink
        isHorizontal
        background={CardBackgrounds.SHADOW}
        badges={[{ label: 'any-badge' }]}
        className="any-classname-mock"
        details={{
          bottom: { className: 'any-classname-bottom-mock', content: 'any-content-bottom-mock' },
          top: { className: 'any-classname-top-mock', content: 'any-content-top-mock' },
        }}
        Heading={HeadingTag.H1}
        link="any-link-mock"
        media={{ alt: 'media-alt-mock', src: 'media-src-mock' }}
        size={Sizes.LARGE}
        title="Card title mock">
        any description text treat as children
      </CardComponent>,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should optionnal classnames on the main container', () => {
    // when
    const { container } = render(
      <CardComponent
        enlargeLink
        isHorizontal
        background={CardBackgrounds.SHADOW}
        className="any-classname-mock"
        size={Sizes.LARGE}
        title="Card title mock">
        any description text treat as children
      </CardComponent>,
    );
    const element = container.firstChild;

    // then
    expect(element).toHaveClass('fr-enlarge-link');
    expect(element).toHaveClass('fr-card--horizontal');
    expect(element).toHaveClass('fr-card--shadow');
    expect(element).toHaveClass('any-classname-mock');
    expect(element).toHaveClass('fr-card--lg');
  });

  it('should render the heading tag with a link and the title', () => {
    // when
    const { getByRole } = render(
      <CardComponent Heading={HeadingTag.H1} link="any-link-mock" title="Card title mock">
        any description text treat as children
      </CardComponent>,
    );
    const titleElt = getByRole('heading', { level: 1 });

    // then
    expect(titleElt).toBeInTheDocument();
    expect(titleElt).toHaveClass('fr-card__title');
    expect(titleElt).toHaveAttribute('data-testid', 'CardComponent-title');
    expect(Link).toHaveBeenCalledOnce();
    expect(Link).toHaveBeenCalledWith(
      {
        children: 'Card title mock',
        to: 'any-link-mock',
      },
      {},
    );
  });

  it('should render the description', () => {
    // when
    const { getByText } = render(
      <CardComponent title="Card title mock">any description text treat as children</CardComponent>,
    );
    const element = getByText('any description text treat as children');

    // then
    expect(element).toBeInTheDocument();
  });

  it('should render the card details (top, bottom)', () => {
    // when
    render(
      <CardComponent
        details={{
          bottom: { className: 'any-classname-bottom-mock', content: 'any-content-bottom-mock' },
          top: { className: 'any-classname-top-mock', content: 'any-content-top-mock' },
        }}
        title="Card title mock">
        any description text treat as children
      </CardComponent>,
    );

    // then
    expect(CardDetailComponent).toHaveBeenCalledTimes(2);
    expect(CardDetailComponent).toHaveBeenNthCalledWith(
      1,
      {
        className: 'any-classname-bottom-mock',
        content: 'any-content-bottom-mock',
        dataTestId: 'CardComponent-detail-bottom',
      },
      {},
    );
    expect(CardDetailComponent).toHaveBeenNthCalledWith(
      2,
      {
        className: 'any-classname-top-mock',
        content: 'any-content-top-mock',
        dataTestId: 'CardComponent-detail-top',
      },
      {},
    );
  });

  it('should render the media', () => {
    // when
    render(
      <CardComponent
        media={{ alt: 'media-alt-mock', src: 'media-src-mock' }}
        title="Card title mock">
        any description text treat as children
      </CardComponent>,
    );

    // then
    expect(CardMediaComponent).toHaveBeenCalledOnce();
    expect(CardMediaComponent).toHaveBeenCalledWith(
      {
        alt: 'media-alt-mock',
        src: 'media-src-mock',
      },
      {},
    );
  });

  it('should render the badges group', () => {
    // when
    render(
      <CardComponent badges={[{ label: 'any-badge-mock' }]} title="Card title mock">
        any description text treat as children
      </CardComponent>,
    );

    // then
    expect(BadgesGroupComponent).toHaveBeenCalledOnce();
    expect(BadgesGroupComponent).toHaveBeenCalledWith(
      {
        item: [{ label: 'any-badge-mock' }],
      },
      {},
    );
  });
});
