import LogoSVG from './logo.svg';

type LogoFranceConnectPlusProps = {
  className?: string;
};

const LogoFranceConnectPlusComponent = ({
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

LogoFranceConnectPlusComponent.defaultProps = {
  className: '',
};

LogoFranceConnectPlusComponent.displayName = 'LogoFranceConnectPlusComponent';

export default LogoFranceConnectPlusComponent;
