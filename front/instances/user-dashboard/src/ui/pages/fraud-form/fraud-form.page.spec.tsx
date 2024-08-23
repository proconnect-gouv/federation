import { render } from '@testing-library/react';

import { useStylesQuery, useStylesVariables } from '@fc/styles';

import { FraudFormPage } from './fraud-form.page';

describe('FraudFormPage', () => {
  beforeEach(() => {
    // @NOTE used to prevent useStylesVariables.useStylesContext to throw
    // useStylesContext requires to be into a StylesProvider context
    jest.mocked(useStylesVariables).mockReturnValueOnce([expect.any(Number), expect.any(Number)]);
  });

  it('should match the snapshot on mobile layout', () => {
    // given
    jest.mocked(useStylesQuery).mockReturnValue(false);

    // when
    const { container } = render(<FraudFormPage />);
    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot on desktop layout', () => {
    // given
    jest.mocked(useStylesQuery).mockReturnValue(true);

    // when
    const { container } = render(<FraudFormPage />);
    // then
    expect(container).toMatchSnapshot();
  });

  it('should render the main title', () => {
    // given
    const { getByRole } = render(<FraudFormPage />);

    // when
    const element = getByRole('heading');

    // then
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Signalez une usurpation d’identité');
  });
});
