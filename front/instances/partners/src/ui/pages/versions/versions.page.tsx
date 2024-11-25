import React from 'react';

import { VersionsListComponent } from '@fc/core-partners';
import { Sizes, TileComponent } from '@fc/dsfr';
import { t } from '@fc/i18n';

import { useVersions } from '../../../hooks';
import { CreateButton } from '../../components';

export const VersionsPage = React.memo(() => {
  const { hasItems, items } = useVersions();

  return (
    <div className="fr-col-12 fr-col-md-6">
      <div className="fr-col-12">
        <h1>{t('Partners.homepage.sandbox_title')}</h1>
      </div>
      {hasItems && (
        <React.Fragment>
          <div className="fr-col-12">
            <CreateButton />
          </div>
          <div className="fr-col-12">
            <VersionsListComponent items={items} />
          </div>
        </React.Fragment>
      )}
      {!hasItems && (
        <div className="fr-col-12">
          <TileComponent
            isHorizontal
            description={t('Partners.homepage.create_tile_desc')}
            link="create"
            size={Sizes.LARGE}
            title={t('Partners.homepage.create_tile_title')}
          />
        </div>
      )}
      <div className="fr-col-12">
        <TileComponent
          isHorizontal
          description={t('Partners.homepage.sandbox_tile_desc')}
          link="."
          size={Sizes.LARGE}
          title={t('Partners.homepage.sandbox_tile_title')}
        />
      </div>
    </div>
  );
});

VersionsPage.displayName = 'VersionsPage';
