import classnames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

import type { PropsWithClassName } from '@fc/common';

import { IconPlacement, Sizes } from '../../enums';

interface LinkComponentProps extends PropsWithChildren, PropsWithClassName {
  href: string;
  icon?: string;
  iconPlacement?: IconPlacement;
  size?: Sizes;
  label?: string | undefined;
  external?: boolean;
}

export const LinkComponent = React.memo(
  ({
    children,
    className,
    external = false,
    href,
    icon,
    iconPlacement = IconPlacement.LEFT,
    label = undefined,
    size = Sizes.MEDIUM,
  }: LinkComponentProps) => (
    <Link
      className={classnames(
        `fr-link fr-link--${size}`,
        {
          [`fr-icon-${icon}`]: !!icon,
          [`fr-link--icon-${iconPlacement}`]: !!icon,
        },
        className,
      )}
      reloadDocument={external}
      to={href}>
      {label || children}
    </Link>
  ),
);

LinkComponent.displayName = 'LinkComponent';
