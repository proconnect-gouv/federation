// @see _doc/jest.md
import { render } from '@testing-library/react';

import { LayoutHeaderToolsAccountComponent } from './layout-header-tools-account.component';

describe('LayoutHeaderToolsAccountComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match the snapshot, when isMobile true', () => {
    // when
    const { container } = render(
      <LayoutHeaderToolsAccountComponent
        isMobile
        familyName="any-familyName-mock"
        givenName="any-givenName-mock"
      />,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, when isMobile false', () => {
    // when
    const { container } = render(
      <LayoutHeaderToolsAccountComponent
        familyName="any-familyName-mock"
        givenName="any-givenName-mock"
        isMobile={false}
      />,
    );
    // then
    expect(container).toMatchSnapshot();
  });

  it('should render familyName', () => {
    // when
    const { getByText } = render(
      <LayoutHeaderToolsAccountComponent
        isMobile
        familyName="any-familyName-mock"
        givenName="any-givenName-mock"
      />,
    );
    const element = getByText(/any-givenName-mock/);
    // then
    expect(element).toBeInTheDocument();
  });

  it('should render givenName', () => {
    // when
    const { getByText } = render(
      <LayoutHeaderToolsAccountComponent
        isMobile
        familyName="any-familyName-mock"
        givenName="any-givenName-mock"
      />,
    );
    const element = getByText(/any-familyName-mock/);
    // then
    expect(element).toBeInTheDocument();
  });
});
