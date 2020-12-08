import { IJsonifiedLightResponseXml } from '../../src/interfaces';

export const lightResponseFailureMandatoryJsonMock: IJsonifiedLightResponseXml = {
  _declaration: {
    _attributes: { version: '1.0', encoding: 'UTF-8', standalone: 'yes' },
  },
  lightResponse: {
    id: {
      _text: '_BmPONbKyIB64fyNTQoyzZr_r5pXeyDGwUTS-bfo_zzhb_.Us9f.XZE2.mcqyM1u',
    },
    inResponseToId: {
      _text: '1602861970744',
    },
    issuer: {
      _text:
        'https://eidas-fr.docker.dev-franceconnect.fr/EidasNode/ConnectorMetadata',
    },
    subjectNameIdFormat: {
      _text: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    },
    subject: {
      _text: '0123456',
    },
    levelOfAssurance: {
      _text: 'http://eidas.europa.eu/LoA/substantial',
    },
    status: {
      failure: {
        _text: 'true',
      },
    },
  },
};

export const lightResponseFailureMandatoryXmlMock = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<lightResponse>
  <id>_BmPONbKyIB64fyNTQoyzZr_r5pXeyDGwUTS-bfo_zzhb_.Us9f.XZE2.mcqyM1u</id>
  <inResponseToId>1602861970744</inResponseToId>
  <issuer>https://eidas-fr.docker.dev-franceconnect.fr/EidasNode/ConnectorMetadata</issuer>
  <subjectNameIdFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</subjectNameIdFormat>
  <subject>0123456</subject>
  <levelOfAssurance>http://eidas.europa.eu/LoA/substantial</levelOfAssurance>
  <status>
    <failure>true</failure>
  </status>
</lightResponse>
`;
