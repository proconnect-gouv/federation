import LogoSVG from './logo.svg';

type LogoMarianneProps = {
  className?: string;
};

export const LogoMarianneComponent = ({ className }: LogoMarianneProps) => (
  <div className={className}>
    <img src={LogoSVG} alt="république francaise" className="logo-marianne mr24" width="73" height="66" />
  </div>
);

LogoMarianneComponent.defaultProps = {
  className: '',
};

LogoMarianneComponent.displayName = 'LogoMarianneComponent';
