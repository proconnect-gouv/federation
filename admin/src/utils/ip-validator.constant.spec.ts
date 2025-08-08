import { IP_VALIDATOR_REGEX } from '../utils/ip-validator.constant';

describe('ipValidator', () => {
  /*regex with mg (multiline global) for test readability */
  const IP_VALIDATOR_REGEX_MG = new RegExp(
    `${IP_VALIDATOR_REGEX.source}`,
    'mg',
  );
  it('should accept empty string', () => {
    expect(IP_VALIDATOR_REGEX_MG.test('')).toBeTruthy();
  });

  describe('IPV4', () => {
    it('should validate ip without mask', () => {
      expect(
        IP_VALIDATOR_REGEX_MG.test(`
          1.1.1.1
          195.25.216.208
      `),
      ).toBeTruthy();
    });

    it('sould not validate over 255.255.255.255', () => {
      expect(IP_VALIDATOR_REGEX_MG.test('999.999.999.999')).toBeFalsy();
    });

    it('should validate with a mask', () => {
      expect(
        IP_VALIDATOR_REGEX_MG.test(`
          1.1.1.1/27
          195.25.216.208/28
      `),
      ).toBeTruthy();
    });

    it('sould not validate with mask over 33', () => {
      expect(IP_VALIDATOR_REGEX_MG.test('195.25.216.208/45')).toBeFalsy();
    });

    it('should match mulitple lines', () => {
      expect(
        IP_VALIDATOR_REGEX_MG.test(`
          195.25.216.208/45
          195.25.216.208
        `),
      ).toBeTruthy();
    });
  });

  describe('IPV6', () => {
    it('should validate ip without mask', () => {
      expect(
        IP_VALIDATOR_REGEX_MG.test(`
          2001:0db8:0000:85a3:0000:0000:ac1f:8001
          2001:db8:0:85a3:0:0:ac1f:8001
          2001:db8:0:85a3::ac1f:8001
          2001:0db8:00f4:0845::
          ::1
        `),
      ).toBeTruthy();
    });

    it('should validate with a mask', () => {
      expect(
        IP_VALIDATOR_REGEX_MG.test(`
          2001:0db8:00f4:0845::/64
          ::1/128
      `),
      ).toBeTruthy();
    });

    it('should match mulitple lines', () => {
      expect(
        IP_VALIDATOR_REGEX_MG.test(`
          2001:0db8:00f5:0845::/64
          :00f5:1/128
        `),
      ).toBeTruthy();
    });
  });
});
