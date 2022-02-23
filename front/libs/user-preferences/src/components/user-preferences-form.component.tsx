import './user-preferences.scss';

import React, { FormEventHandler } from 'react';

import { ButtonSimpleComponent, FieldCheckboxComponent } from '@fc/backoffice';

import { Service } from '../interfaces';
import { ServicesListComponent } from './services-list.component';

interface UserPreferencesFormComponentProps {
  canNotSubmit: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  identityProviders: Service[] | undefined;
  showNotification: boolean;
}

export const UserPreferencesFormComponent: React.FC<UserPreferencesFormComponentProps> = React.memo(
  ({
    canNotSubmit,
    identityProviders,
    onSubmit,
    showNotification,
  }: UserPreferencesFormComponentProps) => (
    <form data-testid="user-preferences-form" onSubmit={onSubmit}>
      <h2 className="is-h6 mt40">
        <b>Vos réglages&nbsp;:</b>
      </h2>
      <p className="mt16 lh24 fs16">
        Attention&nbsp;:&nbsp;<u>Vous devez avoir au moins un compte autorisé</u> pour continuer à
        utiliser FranceConnect. Nous vous conseillons de ne bloquer que les comptes que vous
        n’utilisez pas.
      </p>
      <ServicesListComponent identityProviders={identityProviders} />
      <p className="mt40 lh24 fs16">
        Pour vous offrir toujours plus de choix, il est possible que FranceConnect mette à votre
        disposition de nouveaux moyens d’identification dans le futur. En cochant cette case, ils ne
        pourront pas être utilisés pour accéder aux services proposant FranceConnect.
      </p>
      <p className="mt16 lh24 fs16">Vous pourrez les autoriser depuis cette page.</p>
      <FieldCheckboxComponent
        className="is-bold mt20"
        label="Bloquer par défaut les nouveaux moyens de connexion dans FranceConnect"
        name="allowFutureIdp"
      />
      <div className="mt88 text-center">
        <ButtonSimpleComponent
          className="py12 px32"
          disabled={canNotSubmit}
          label="Enregistrer mes réglages"
          type="submit"
        />
        {showNotification && (
          <p className="mt12">
            Une notification récapitulant les modifications va vous être envoyée
          </p>
        )}
      </div>
    </form>
  ),
);

UserPreferencesFormComponent.displayName = 'UserPreferencesFormComponent';
