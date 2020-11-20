import { ValidateEuropeanIdentity } from './validate-european-identity.dto';
import { EidasBridgeCountries } from '../enum';
import { validateDto } from '@fc/common';

describe('Eidas bridge countries DTO', () => {
  const validationOptions = {
    whitelist: true,
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
  };
  it('should validate with good type and value', async () => {
    // Given
    const data = { country: EidasBridgeCountries.BELGIUM };
    // When
    const result = await validateDto(
      data,
      ValidateEuropeanIdentity,
      validationOptions,
    );
    // Then
    expect(result).toEqual([]);
  });
  it('should not validate with wrong type', async () => {
    // Given
    const data = { lol: true };
    // When
    const result = await validateDto(
      data,
      ValidateEuropeanIdentity,
      validationOptions,
    );
    // Then
    expect(result).not.toEqual([]);
  });
  it('should not validate with wrong value', async () => {
    // Given
    const data = { country: 'US' };
    // When
    const result = await validateDto(
      data,
      ValidateEuropeanIdentity,
      validationOptions,
    );
    // Then
    expect(result).not.toEqual([]);
  });
});
