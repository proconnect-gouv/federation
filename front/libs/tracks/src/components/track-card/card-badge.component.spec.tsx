import { render } from '@testing-library/react';

import { TrackCardBadgeComponent } from './card-badge.component';

describe('TrackCardBadgeComponent', () => {
  it('should always render a FranceConnect badge', () => {
    // given
    const { getByText } = render(<TrackCardBadgeComponent fromFcPlus={false} type="FC_VERIFIED" />);
    // when
    const element = getByText('FranceConnect');
    // then
    expect(element).toBeInTheDocument();
    expect(element.parentElement).toHaveClass('bg-blue-france');
    expect(element.parentElement).not.toHaveClass('bg-blue-agentconnect');
  });

  it('render a FranceConnectPlus badge', () => {
    // given
    const { getByText } = render(<TrackCardBadgeComponent fromFcPlus type="FC_VERIFIED" />);
    // when
    const element = getByText('FranceConnect+');
    // then
    expect(element).toBeInTheDocument();
    expect(element.parentElement).not.toHaveClass('bg-blue-france');
    expect(element.parentElement).toHaveClass('bg-blue-agentconnect');
  });

  it('should always render the FC_VERIFIED badge', () => {
    // given
    const { getByText } = render(<TrackCardBadgeComponent fromFcPlus type="FC_VERIFIED" />);
    // when
    const element = getByText('Connexion');
    // then
    expect(element).toBeInTheDocument();
  });

  it('should always render the FC_DATATRANSFER:CONSENTIDENTITY badge', () => {
    // given
    const { getByText } = render(
      <TrackCardBadgeComponent fromFcPlus type="FC_DATATRANSFER:CONSENTIDENTITY" />,
    );
    // when
    const element = getByText('Autorisation');
    // then
    expect(element).toBeInTheDocument();
  });

  it('should always render the FC_DATATRANSFER:CONSENT:DATA badge', () => {
    // given
    const { getByText } = render(
      <TrackCardBadgeComponent fromFcPlus type="FC_DATATRANSFER:CONSENT:DATA" />,
    );
    // when
    const element = getByText('Échange de Données');
    // then
    expect(element).toBeInTheDocument();
  });

  it('should not render any type badge', () => {
    // given
    const { getByTestId } = render(<TrackCardBadgeComponent fromFcPlus type={undefined} />);
    // then
    expect(() => getByTestId('badge')).toThrow();
  });
});
