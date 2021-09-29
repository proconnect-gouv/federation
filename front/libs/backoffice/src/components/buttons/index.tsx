import { ButtonEventType } from '@fc/oidc-client';
import './index.scss';

type LoadButtonProps = {
  onClick: ButtonEventType;
};

export const LoadButtonComponent = ({
  onClick,
}: LoadButtonProps): JSX.Element => {
  return (
    <button
      className="LoadButtonComponent fs18 p12"
      type="button"
      onClick={onClick}
    >
      <span>LOAD SOMETHING</span>
    </button>
  );
};

LoadButtonComponent.displayName = 'LoadButtonComponent';
