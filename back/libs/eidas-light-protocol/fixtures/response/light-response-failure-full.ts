import { IJsonifiedLightResponseXml, IResponse } from '../../src/interfaces';

export const failureFullJsonMock: IResponse = {
  id: '_BmPONbKyIB64fyNTQoyzZr_r5pXeyDGwUTS-bfo_zzhb_.Us9f.XZE2.mcqyM1u',
  inResponseToId: '1602861970744',
  issuer:
    'https://eidas-fr.docker.dev-franceconnect.fr/EidasNode/ConnectorMetadata',
  ipAddress: '127.0.0.1',
  relayState: 'myState',
  subject: '0123456',
  subjectNameIdFormat: 'unspecified',
  levelOfAssurance: 'low',
  status: {
    failure: 'true',
    statusCode: 'Requester',
    subStatusCode: 'AuthnFailed',
    statusMessage: 'myMessage',
  },
};

export const lightResponseFailureFullJsonMock: IJsonifiedLightResponseXml = {
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
    relayState: {
      _text: 'myState',
    },
    subjectNameIdFormat: {
      _text: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    },
    subject: {
      _text: '0123456',
    },
    levelOfAssurance: {
      _text: 'http://eidas.europa.eu/LoA/low',
    },
    status: {
      failure: {
        _text: 'true',
      },
      statusCode: {
        _text: 'urn:oasis:names:tc:SAML:2.0:status:Requester',
      },
      statusMessage: {
        _text: 'myMessage',
      },
      subStatusCode: {
        _text: 'urn:oasis:names:tc:SAML:2.0:status:AuthnFailed',
      },
    },
  },
};

export const lightResponseFailureFullXmlMock = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<lightResponse>
  <id>_BmPONbKyIB64fyNTQoyzZr_r5pXeyDGwUTS-bfo_zzhb_.Us9f.XZE2.mcqyM1u</id>
  <inResponseToId>1602861970744</inResponseToId>
  <issuer>https://eidas-fr.docker.dev-franceconnect.fr/EidasNode/ConnectorMetadata</issuer>
  <relayState>myState</relayState>
  <subjectNameIdFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</subjectNameIdFormat>
  <subject>0123456</subject>
  <levelOfAssurance>http://eidas.europa.eu/LoA/low</levelOfAssurance>
  <status>
    <failure>true</failure>
    <statusCode>urn:oasis:names:tc:SAML:2.0:status:Requester</statusCode>
    <statusMessage>myMessage</statusMessage>
    <subStatusCode>urn:oasis:names:tc:SAML:2.0:status:AuthnFailed</subStatusCode>
  </status>
</lightResponse>
`;
