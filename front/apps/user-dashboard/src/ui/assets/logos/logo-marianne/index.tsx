import LogoSVG from './logo.svg';

type LogoMarianneProps = {
  className?: string;
};

const LogoMarianneComponent = ({ className }: LogoMarianneProps) => (
  <div className={className}>
    <img alt="république francaise" height="115" src={LogoSVG} width="127" />
  </div>
);

LogoMarianneComponent.defaultProps = {
  className: '',
};

LogoMarianneComponent.displayName = 'LogoMarianneComponent';

export default LogoMarianneComponent;
