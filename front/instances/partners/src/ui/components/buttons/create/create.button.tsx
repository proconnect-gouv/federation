import React from 'react';

import { IconPlacement, LinkButton, Priorities } from '@fc/dsfr';
import { t } from '@fc/i18n';

export const CreateButton = React.memo(() => (
  <LinkButton
    noOutline
    icon="add-line"
    iconPlacement={IconPlacement.LEFT}
    link="create"
    priority={Priorities.TERTIARY}>
    {t('Partners.button.create_instance')}
  </LinkButton>
));

CreateButton.displayName = 'CreateButton';
