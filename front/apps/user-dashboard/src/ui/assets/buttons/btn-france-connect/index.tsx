/* eslint
  react/button-has-type: 0
  */
// !!! react/button-has-type: 0
// typescript crie même avec un valeur par défaut ¯\_(ツ)_/¯
import ButtonSVG from './button.svg';

const defaultProps = {
  className: '',
  onClick: null,
  type: 'button',
};
type DefaultProps = Partial<typeof defaultProps>;

type ButtonFranceConnectProps = {
  type?: 'button' | 'submit' | 'reset' | undefined;
  onClick?: Function;
  className?: string;
} & DefaultProps;

const ButtonFranceConnectComponent = ({
  className,
  onClick,
  type,
}: ButtonFranceConnectProps) => (
  <button className={className} type={type} onClick={onClick}>
    <img
      alt="S'identifier avec France Connect"
      height="auto"
      src={ButtonSVG}
      width="auto"
    />
  </button>
);

ButtonFranceConnectComponent.defaultProps = defaultProps;

ButtonFranceConnectComponent.displayName = 'ButtonFranceConnectComponent';

export default ButtonFranceConnectComponent;
