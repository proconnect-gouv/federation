import LogoSVG from './logo.svg';

type LogoFranceConnectPlusProps = {
  className?: string;
};

const LogoFranceConnectComponent = ({
  className,
}: LogoFranceConnectPlusProps) => (
  <div className={className}>
    <img
      alt="marianne hexagonale franceconnect plus"
      height="auto"
      src={LogoSVG}
      width="140"
    />
  </div>
);

LogoFranceConnectComponent.defaultProps = {
  className: '',
};

LogoFranceConnectComponent.displayName = 'LogoFranceConnectComponent';

export default LogoFranceConnectComponent;
