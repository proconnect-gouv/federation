import BackToServiceProviderButton from './back-to-serviceprovider-btn';

const LayoutHeaderComponent = () => (
  <header className="d-flex flex-row justify-content-between align-items-center py-3 mb-5">
    <div>
      <img
        alt="République Française - Liberté, Égalité, Fraternité"
        src="/img/logo-marianne.svg"
      />
      <img
        alt="Agent Connect"
        className="mx-4"
        src="/img/logo-agentconnect.svg"
      />
    </div>
    <BackToServiceProviderButton />
  </header>
);

LayoutHeaderComponent.displayName = 'LayoutHeaderComponent';

export default LayoutHeaderComponent;
