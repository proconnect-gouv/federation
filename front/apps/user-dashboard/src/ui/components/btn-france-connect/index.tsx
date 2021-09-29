/* eslint
  react/button-has-type: 0
  */
import classnames from 'classnames';

// !!! react/button-has-type: 0
// typescript crie même avec un valeur par défaut ¯\_(ツ)_/¯
import { ReactComponent as ButtonSVG } from './button.svg';
import './index.scss';

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

export const ButtonFranceConnectComponent = ({
  className,
  onClick,
  type,
}: ButtonFranceConnectProps) => {
  return (
    <button
      className={classnames(className, 'button')}
      type={type}
      onClick={onClick}
    >
      <ButtonSVG title="S'identifier avec France Connect" />
    </button>
  );
};

ButtonFranceConnectComponent.defaultProps = defaultProps;

ButtonFranceConnectComponent.displayName = 'ButtonFranceConnectComponent';
