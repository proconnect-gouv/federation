import React from 'react';

interface SubmitButtonProps {
  isDisabled?: boolean;
  label?: string;
}

function SubmitButtonComponent({
  isDisabled,
  label,
}: SubmitButtonProps): JSX.Element {
  return (
    <button className="btn" disabled={isDisabled} type="submit">
      {label}
    </button>
  );
}

SubmitButtonComponent.defaultProps = {
  isDisabled: false,
  label: undefined,
} as SubmitButtonProps;

export default SubmitButtonComponent;
