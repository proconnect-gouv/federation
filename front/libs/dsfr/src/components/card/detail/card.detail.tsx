import classnames from 'classnames';
import React from 'react';

interface CardDetailComponentProps {
  content: string;
  className?: string | undefined;
}

export const CardDetailComponent = React.memo(
  ({ className = undefined, content }: CardDetailComponentProps) => (
    <p className={classnames('fr-card__detail', className)}>{content}</p>
  ),
);

CardDetailComponent.displayName = 'CardDetailComponent';
