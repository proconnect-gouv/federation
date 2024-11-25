import { render } from '@testing-library/react';

import { CardMediaComponent } from './card.media';

describe('CardMediaComponent', () => {
  it('should match the snapshot', () => {
    // when
    const { container } = render(<CardMediaComponent alt="Image alt mock" src="test-image.jpg" />);

    // then
    expect(container).toMatchSnapshot();
  });

  it('should render an image with the defined alt and src', () => {
    // when
    const { getByAltText } = render(
      <CardMediaComponent alt="Image alt mock" src="test-image.jpg" />,
    );
    const imageElement = getByAltText('Image alt mock');

    // then
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', 'test-image.jpg');
  });

  it('should render an image with empty alt if alt is not defined', () => {
    // when
    const { getByAltText } = render(<CardMediaComponent src="test-image.jpg" />);
    const imageElement = getByAltText('');

    // then
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', 'test-image.jpg');
  });
});
