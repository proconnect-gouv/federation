import LogoSVG from './logo.svg';

type LogoAgentConnectProps = {
  className?: string;
};

export const LogoAgentConnectComponent = ({
  className,
}: LogoAgentConnectProps) => (
  <div className={className}>
    <img
      src={LogoSVG}
      alt="marianne hexagonale agentconnect"
      width="96"
      height="54"
    />
  </div>
);

LogoAgentConnectComponent.defaultProps = {
  className: '',
};

LogoAgentConnectComponent.displayName = 'LogoAgentConnectComponent';
