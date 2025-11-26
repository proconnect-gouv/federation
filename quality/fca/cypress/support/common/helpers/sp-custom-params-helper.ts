// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateCustomParams = (updater: (customParams: any) => any): void => {
  cy.get('[name="custom-params"]')
    .invoke('val')
    .then((customParamsAsText) => {
      const customParams = JSON.parse(customParamsAsText as string);

      const newCustomParams = updater(customParams);
      // note that null property should be set to a falsy
      const newCustomParamsAsText = JSON.stringify(newCustomParams, null, 2);

      cy.get('[name="custom-params"]').clear({ force: true });
      cy.get('[name="custom-params"]').type(newCustomParamsAsText, {
        delay: 0,
        force: true,
        parseSpecialCharSequences: false,
      });
    });
};

export const setScope = (scope: string): void => {
  updateCustomParams((customParams) => {
    customParams['scope'] = scope;

    return customParams;
  });
};

export const setAcrValues = (acrValues: string): void => {
  updateCustomParams((customParams) => {
    customParams['acr_values'] = acrValues;

    return customParams;
  });
};

export const setIdpHint = (idpHint: string): void => {
  updateCustomParams((customParams) => {
    customParams['idp_hint'] = idpHint;

    return customParams;
  });
};

export const setLoginHint = (loginHint: string): void => {
  updateCustomParams((customParams) => {
    customParams['login_hint'] = loginHint;

    return customParams;
  });
};

export const setSiretHint = (siretHint: string): void => {
  updateCustomParams((customParams) => {
    customParams['siret_hint'] = siretHint;

    return customParams;
  });
};

export const setRedirectUri = (redirectUri: string): void => {
  updateCustomParams((customParams) => {
    customParams['redirect_uri'] = redirectUri;

    return customParams;
  });
};

export const setPrompt = (prompt: string): void => {
  updateCustomParams((customParams) => {
    customParams['prompt'] = prompt;

    return customParams;
  });
};

export const removePrompt = (): void => {
  updateCustomParams((customParams) => {
    delete customParams['prompt'];

    return customParams;
  });
};

export const setAsVoluntaryClaims = (claim: string): void => {
  updateCustomParams((customParams) => {
    customParams['claims']['id_token'] = {
      [claim]: null,
    };

    return customParams;
  });
};

export const setAsRequestedClaims = (
  claim: string,
  value?: string | string[],
): void => {
  updateCustomParams((customParams) => {
    customParams['claims']['id_token'] = {
      [claim]: { essential: true },
    };

    if (Array.isArray(value)) {
      customParams['claims']['id_token'][claim]['values'] = value;
    } else if (typeof value === 'string') {
      customParams['claims']['id_token'][claim]['value'] = value;
    }

    return customParams;
  });
};

export const removeFromRequestedClaims = (claim: string): void => {
  updateCustomParams((customParams) => {
    delete customParams['claims']['id_token'][claim];

    return customParams;
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const interceptAuthorizeParam = (updater: (customParams: any) => any): void => {
  cy.intercept(
    {
      method: 'GET',
      url: /\/authorize(\?.*)?$/,
    },
    (req) => {
      const newCustomParams = updater(req.query);
      req.query = newCustomParams;
      req.continue();
    },
  ).as(`interceptAuthorizeParam`);
};

export const removeCodeChallengeMethod = (): void => {
  interceptAuthorizeParam((customParams) => {
    delete customParams['code_challenge_method'];

    return customParams;
  });
};

export const setCodeChallengeMethod = (codeChallengeMethod: string): void => {
  interceptAuthorizeParam((customParams) => {
    customParams['code_challenge_method'] = codeChallengeMethod;

    return customParams;
  });
};
