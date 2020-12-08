/* istanbul ignore file */

// Declarative code
import { EidasAttributes, EidasLevelOfAssurances } from '@fc/eidas';

export const EidasToOidcLevelOfAssurancesMap = {
  [EidasLevelOfAssurances.SUBSTANTIAL]: 'eidas2',
  [EidasLevelOfAssurances.HIGH]: 'eidas3',
};

export const EidasToOidcAttributesMap = {
  [EidasAttributes.PERSON_IDENTIFIER]: ['openid'],
  [EidasAttributes.CURRENT_GIVEN_NAME]: ['given_name'],
  [EidasAttributes.CURRENT_FAMILY_NAME]: ['preferred_username', 'family_name'],
  [EidasAttributes.BIRTH_NAME]: ['family_name'],
  [EidasAttributes.DATE_OF_BIRTH]: ['birthdate'],
  [EidasAttributes.PLACE_OF_BIRTH]: ['birthplace', 'birthcountry'],
  [EidasAttributes.GENDER]: ['gender'],
};
