import { CoreFcaSession } from '@fc/core';

export default {
  App: {
    name: 'Proconnect Fédération',
    urlPrefix: '/api/v2',
    assetsPaths: ['../../../apps/core-fca-low/src'],
    assetsDsfrPaths: [
      {
        assetPath: '../../../node_modules/@gouvfr/dsfr/dist/dsfr',
        prefix: '/dsfr',
      },
      {
        assetPath: '../../../node_modules/@gouvfr/dsfr/dist/fonts',
        prefix: '/fonts',
      },
      {
        assetPath: '../../../node_modules/@gouvfr/dsfr/dist/icons',
        prefix: '/icons',
      },
      {
        assetPath: '../../../node_modules/@gouvfr/dsfr/dist/utility/icons',
        prefix: '/utility',
      },
    ],
    assetsCacheTtl: 3600,
    viewsPaths: ['../../../apps/core-fca-low/src'],
    httpsOptions: {
      key:
        '-----BEGIN PRIVATE KEY-----\n' +
        'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvSm6TViTqylyb\n' +
        'iu8y+7EX6rARH9tfNXD0w5mR/tvAGyzU7ybfhjFGri8DlwlV0rXaBz/MQ3yd8Bwa\n' +
        'RP4PWoxddZD5hDPIOq+3hY2v51YZZp7/7G9aQ3EH3BITDzXl4MJ45+VJ38NntfCe\n' +
        'kg/2C9/46D1Zg8JgoN0Rmu1NgCfaoQbZ4nebWCB0GjSN6lz1GRBYmqZXKChijSNv\n' +
        'gf85H/WtwN/nLOIJCJKTQZJ3tjLRrzVoSI6wrpTYhDIK4PozGyY0fXKpaptJ2vQ0\n' +
        'tMtvcwYGbjryJUaL1lNiX5wrZSVjbXxwOhqUP62JcyPWgfkfCtqkXBac0o7JRucT\n' +
        'y2ypmReBAgMBAAECggEAboEq0kFVRprJ5NiiUO6wxtYRpsoBfrTu/66riokzOZko\n' +
        'Gxik1fb/64H1a3r0zKDoOYmmY3wL/HkZDkp+K2m24VgzS8lW55xvl+9e0gyxj5PN\n' +
        'GqOP00R+5iiLUG6fWMrnblcqifbBdgkRprWH0GHOEVk/C8ZvbIEcvHOBtADdnwon\n' +
        'VhRyOJXI/CrennimwdOsOpcB9qsLXmkRA1geCIQq7JGnxx4dh3shO25VRxqRiYtW\n' +
        'j5h1xy4z1MO0BTNmXaPReoXZXp9xXqCH6TkH2yL2RfOVz2huEza/g2yq56dZLXpp\n' +
        'XV43stfZk8sCi1eufTPbnZ50s/6u3e8ip857G0iNjQKBgQDaJVQBJH8fqUObC2z8\n' +
        'QwtstLKtVWlPn7K6efoIGoePOEjDtRCh1lL56mAF0dwVF98xwgNThLphNAW32eit\n' +
        'ju1bMan+R+/Vx0edCh/4VkU/665laN2kMlumn5FSDRHlCZkWZlvAzuMeXCaHWp7V\n' +
        'nvbW/T3zIGsdTZ2ZDXbGrSjtDwKBgQDNtVtvM7X0C/5FCJNw+fb/Yx9VSk9uTlKq\n' +
        'Q/m1WRylItNZNLUPUWht7si/V99hBeqO/Gxx98APUFnqD1CyzKbmHiMiKlcDQw0+\n' +
        'O+TnsZ1yeT5msmphSM/wBUwSgspWy4JtwrAmkhCyBvJdxnVSn7VHvBkTAdhaYrij\n' +
        'ECUOH1zSbwKBgHY+rZ5A7jd3RJISS20h2lt+Ryv1lDP42KSD4afq2XgkhiyvROi0\n' +
        'iB23kX0WGDnGytDp3Wu0EmMGE+NoVttdEgPQk9ilnbc/Ye4ZwuKVwMu5MLr/cMTE\n' +
        'FzHmZJsZQo3n+fdOXIXSnwGh6bCMynP4yswWUTIsbGNh4v9HcQ6YZgq5AoGBAIUP\n' +
        'go1zzYaHG3pcCcNSbUrVOzdYUfjwANjSD3wWoEjRNhTF2ziFWB+EDaZ3mK6RvR+w\n' +
        'eBVgRIOjXgXg0jpV1r+TTvaSnKYngTF4XKDiaw3ZD1wunFFBX//J7WMr5uYtzbhh\n' +
        '7r+ES/hcNfoinVFMrV4xdaat0tzkbrpLfyybbNdRAoGAF8Pvst45j7UBoUslKUlm\n' +
        'Gvv4ctCjAu7XaEJWKi6kHQsIbOCPJk/5PFtR6YkU3MXXjt2OG8D1x5G0KdEox/6V\n' +
        '3VtGn8yK3376fY0A73VSvfxiUvWDbpLlx/gPPgJAT5j/JBPhoo8wYVqV4mvmKc8I\n' +
        'f9AZMRoWsuaLIVEarnqRIME=\n' +
        '-----END PRIVATE KEY-----\n',
      cert:
        '-----BEGIN CERTIFICATE-----\n' +
        'MIIFhzCCA2+gAwIBAgIUEU+242Cr3Fg0ytkCGPdGXE/HJogwDQYJKoZIhvcNAQEL\n' +
        'BQAwdDELMAkGA1UEBhMCRlIxDDAKBgNVBAgMA0lERjEOMAwGA1UEBwwFUEFSSVMx\n' +
        'FjAUBgNVBAoMDUZyYW5jZUNvbm5lY3QxFTATBgNVBAsMDERvY2tlciBTdGFjazEY\n' +
        'MBYGA1UEAwwPRG9ja2VyIFN0YWNrIENBMB4XDTIzMTAyMDA4Mzg1OFoXDTMzMTAx\n' +
        'NzA4Mzg1OFowajELMAkGA1UEBhMCRlIxDDAKBgNVBAgMA0lERjEOMAwGA1UEBwwF\n' +
        'UGFyaXMxFjAUBgNVBAoMDUZyYW5jZUNvbm5lY3QxFTATBgNVBAsMDGRvY2tlci1z\n' +
        'dGFjazEOMAwGA1UEAwwFbW9uZ28wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK\n' +
        'AoIBAQCvSm6TViTqylybiu8y+7EX6rARH9tfNXD0w5mR/tvAGyzU7ybfhjFGri8D\n' +
        'lwlV0rXaBz/MQ3yd8BwaRP4PWoxddZD5hDPIOq+3hY2v51YZZp7/7G9aQ3EH3BIT\n' +
        'DzXl4MJ45+VJ38NntfCekg/2C9/46D1Zg8JgoN0Rmu1NgCfaoQbZ4nebWCB0GjSN\n' +
        '6lz1GRBYmqZXKChijSNvgf85H/WtwN/nLOIJCJKTQZJ3tjLRrzVoSI6wrpTYhDIK\n' +
        '4PozGyY0fXKpaptJ2vQ0tMtvcwYGbjryJUaL1lNiX5wrZSVjbXxwOhqUP62JcyPW\n' +
        'gfkfCtqkXBac0o7JRucTy2ypmReBAgMBAAGjggEZMIIBFTALBgNVHQ8EBAMCBPAw\n' +
        'HwYDVR0jBBgwFoAUn9ZAmpwJp+IkNFKDOAzYnZ3NoLgwHQYDVR0lBBYwFAYIKwYB\n' +
        'BQUHAwEGCCsGAQUFBwMCMIG6BgNVHREEgbIwga+CG2RvY2tlci5kZXYtZnJhbmNl\n' +
        'Y29ubmVjdC5mcoIdKi5kb2NrZXIuZGV2LWZyYW5jZWNvbm5lY3QuZnKCHHJlY2V0\n' +
        'dGUuZGV2LWZyYW5jZWNvbm5lY3QuZnKCHioucmVjZXR0ZS5kZXYtZnJhbmNlY29u\n' +
        'bmVjdC5mcoIJbG9jYWxob3N0giIqLmxsbmcuZG9ja2VyLmRldi1mcmFuY2Vjb25u\n' +
        'ZWN0LmZyhwR/AAABMAkGA1UdEwQCMAAwDQYJKoZIhvcNAQELBQADggIBAIM84iQI\n' +
        'Iq+uBNchVyrq8nCD5bW+xWfMQ3Xmf7uycCg/jX6pA+99TgLhGQh0wZLNF1xOTRBK\n' +
        'cbiWF+crLkqTim5xWjOauNgD1YWw9FAr06VG8lxG07EzA4NcHIVe4D4mPA3m6j0s\n' +
        'vmDvDYScwLGoaTDCupaPPhd2D3v2rOmaYWWNHJZdbBCcldafPmjzvdCRx0YqfuV0\n' +
        'v2Sbr3+tnFBg2HjNGZWXV0DDOG6lfejNEBHyEsoAWI6VtT+oMBrdQJHCu5TBU8rx\n' +
        'zyv/uDQfCEEsuYa4FDLoeCx0BDbahHflAzhOqwhSmn9sUW4CxI+JzyHGpjyAQhZ/\n' +
        'toNlzKAE0FVaKhAcNnowdFFASQmyyFAGjtHz5qZDKfMAcqKkTLRZAD9W44mNcaOB\n' +
        'hh4PX7WqF0G//PBZ4Pd9gGRqUy49OX4PSvNQjI85Qf8YLPA2OOOOV9YzWg8akkat\n' +
        'YOPVF6QoEa1oCrDl8qPnnBR5yaOHqTvIS9HalFsQrmCiHmCmPC3+Dv3uSgoAyhCD\n' +
        '3uj7ov4S5Ltjwz4GP2lVV9O5zM2skN+9jwVUGdGuBNdkWymI+fbJQpBCYU5pZ9nT\n' +
        'S12o0IoIvh72lNCprbivpLpWCkkU8m1YgwXE50nm5qK58izNHbt2lnHwIBffQhj+\n' +
        '7uI7JakSJdtTJCq221JgdG/BKRUk28AGDwQA\n' +
        '-----END CERTIFICATE-----\n',
    },
    fqdn: 'core-fca-low.docker.dev-franceconnect.fr',
    defaultIdpId: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
    spAuthorizedFqdnsConfigs: [
      {
        spId: '6495f347513b860e6b931fae4a1ba70c8489a558a0fc74ecdc094d48a4035e77',
        spName: 'FS4',
        spContact: 'serviceclient@fsa4-low.fr',
        authorizedFqdns: ['fia1.fr', 'fia2.fr'],
      },
    ],
    defaultEmailRenater: 'test@renater.agentconnect.gouv.fr',
    contentSecurityPolicy: {
      defaultSrc: ["'self'", '*.crisp.chat', '*.crisp.help'],
      styleSrc: ["'self'", "'unsafe-inline'", 'client.crisp.chat'],
      scriptSrc: [
        "'self'",
        'stats.data.gouv.fr',
        "'unsafe-inline'",
        'client.crisp.chat',
      ],
      connectSrc: [
        "'self'",
        'stats.data.gouv.fr',
        'https://client.crisp.chat',
        'wss://client.relay.crisp.chat',
        'storage.crisp.chat',
      ],
      frameAncestors: [],
      imgSrc: [
        "'self'",
        'data:',
        'stats.data.gouv.fr',
        'client.crisp.chat',
        'image.crisp.chat',
        'storage.crisp.chat',
        'wss://client.relay.crisp.chat',
      ],
    },
    defaultRedirectUri: 'https://www.proconnect.gouv.fr',
    supportEmail: 'support+federation@proconnect.gouv.fr',
    passeDroitEmailSuffix: '+proconnect',
  },
  EmailValidator: { domainWhitelist: [] },
  Exceptions: { prefix: 'Y' },
  Logger: { threshold: 'debug' },
  LoggerLegacy: { path: '/tmp/core-fca-low.log' },
  OidcProvider: {
    forcedPrompt: ['login'],
    allowedPrompt: ['login', 'consent', 'none'],
    prefix: '/api/v2',
    issuer: 'https://core-fca-low.docker.dev-franceconnect.fr/api/v2',
    configuration: {
      routes: {
        authorization: '/authorize',
        check_session: '/session/check',
        code_verification: '/device',
        device_authorization: '/device/auth',
        end_session: '/session/end',
        introspection: '/token/introspection',
        jwks: '/jwks',
        pushed_authorization_request: '/request',
        registration: '/reg',
        revocation: '/token/revocation',
        token: '/token',
        userinfo: '/userinfo',
      },
      subjectTypes: ['public'],
      cookies: {
        keys: [
          'iet7jaetheezaingahThooSiem3Oothu',
          'aeChoomaeyi5Jeo7Viezoh8aew8ieH3m',
          'JaeDahngohc3athooy1Eip2ahtei8Aep',
          'iu5vu5EeD4goow5eipeizequaetaxo0V',
        ],
        long: { sameSite: 'lax', signed: false, path: '/' },
        short: { sameSite: 'lax', signed: false, path: '/' },
      },
      grant_types_supported: ['authorization_code'],
      features: {
        devInteractions: { enabled: false },
        encryption: { enabled: true },
        introspection: { enabled: true },
        jwtUserinfo: { enabled: true },
        jwtIntrospection: { enabled: true, ack: 'draft-10' },
        backchannelLogout: { enabled: false },
        revocation: { enabled: true },
        rpInitiatedLogout: { enabled: true },
        claimsParameter: { enabled: true },
        resourceIndicators: { enabled: false },
      },
      acceptQueryParamAccessTokens: true,
      ttl: {
        Grant: 43200,
        Interaction: 3600,
        Session: 43200,
        RefreshToken: function () {},
      },
      acrValues: [
        'eidas1',
        'eidas2',
        'eidas3',
        'https://proconnect.gouv.fr/assurance/self-asserted',
        'https://proconnect.gouv.fr/assurance/self-asserted-2fa',
        'https://proconnect.gouv.fr/assurance/consistency-checked',
        'https://proconnect.gouv.fr/assurance/consistency-checked-2fa',
        'https://proconnect.gouv.fr/assurance/certification-dirigeant',
      ],
      scopes: ['openid', 'profile', 'email'],
      issueRefreshToken: function () {},
      claims: {
        amr: ['amr'],
        uid: ['uid'],
        openid: ['sub'],
        profile: ['given_name', 'usual_name'],
        given_name: ['given_name'],
        email: ['email'],
        phone: ['phone_number'],
        organizational_unit: ['organizational_unit'],
        siren: ['siren'],
        siret: ['siret'],
        usual_name: ['usual_name'],
        belonging_population: ['belonging_population'],
        chorusdt: ['chorusdt:matricule', 'chorusdt:societe'],
        idp_id: ['idp_id'],
        idp_acr: ['idp_acr'],
        is_service_public: ['is_service_public'],
        groups: ['groups'],
        custom: ['custom'],
      },
      clientDefaults: {
        grant_types: ['authorization_code', 'refresh_token'],
        id_token_signed_response_alg: 'ES256',
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_post',
        application_type: 'web',
      },
      responseTypes: ['code'],
      revocationEndpointAuthMethods: ['client_secret_post', 'private_key_jwt'],
      tokenEndpointAuthMethods: ['client_secret_post', 'private_key_jwt'],
      enabledJWA: {
        authorizationEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
        authorizationEncryptionEncValues: ['A256GCM'],
        authorizationSigningAlgValues: ['ES256', 'RS256', 'HS256'],
        dPoPSigningAlgValues: ['ES256', 'RS256'],
        idTokenEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
        idTokenEncryptionEncValues: ['A256GCM'],
        idTokenSigningAlgValues: ['ES256', 'RS256', 'HS256'],
        introspectionEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
        introspectionEncryptionEncValues: ['A256GCM'],
        introspectionEndpointAuthSigningAlgValues: ['ES256', 'RS256'],
        introspectionSigningAlgValues: ['ES256', 'RS256', 'HS256'],
        requestObjectEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
        requestObjectEncryptionEncValues: ['A256GCM'],
        requestObjectSigningAlgValues: ['ES256', 'RS256', 'HS256'],
        revocationEndpointAuthSigningAlgValues: ['ES256', 'RS256'],
        tokenEndpointAuthSigningAlgValues: ['ES256', 'RS256'],
        userinfoEncryptionAlgValues: ['ECDH-ES', 'RSA-OAEP'],
        userinfoEncryptionEncValues: ['A256GCM'],
        userinfoSigningAlgValues: ['ES256', 'RS256', 'HS256'],
      },
      extraParams: ['idp_hint'],
      jwks: {
        keys: [
          {
            alg: 'ES256',
            crv: 'P-256',
            x: 'uRxO96Oqn0BEJZYua3rkM9ntzLbt_nDbq4hwSgOUomQ',
            y: 'o9BoK63TMCGmXjOcCZbtOTmw5HdGiy5ZzY4Qo5KG638',
            d: 'sMJDu7_nEjB0SwTKuKR8XiZPHvoUkem3rdgxP39kkfQ',
            kty: 'EC',
            kid: 'pkcs11:ES256:hsm',
            use: 'sig',
          },
          {
            alg: 'RS256',
            kty: 'RSA',
            n: 'vmTVr5evEFVha25McCxJ8D_MV_52eA6j_0VUFE-bBUWjctqXK-Xf6W1lC2e_51RmL2owzl2w4Fw90cqeBzA1S2PJJdI_ptQcnwaCiXGRUMVqLXKxOsx1zqIj69F781_Ujp7bPYMkGNlsNmsY37roOzZLCFZLIJo6o90mrjT42nTkS-lgabyBMRZu783d_W1hs0CcjcOC4Hq2jEo_DVfy1RF5qj-Cr33LJ22Co6rkWb8zZnS9PFDZBJPz1tp53Gd2V6_BGbgETFMQI9-kss9HQCaH_1VXOFNr-zg7jw-XTHxvaQHEpCkhGrusirQB1o0tf2SheVhHXDUkG2q4aVgBqxurw4YONxBQvYY0xPK-OX1jQaWnaYPmB_v7_bt9wUrL4kYqGiVw5pXZZRIOPYloNhK_p7qLTTNjS4BKgveen_Vq32HZF8sLECQorAL7nSJABd0ReZEOBUyxWZ6KbIwnhykdADV2mBKyrFP0ZDKDQQprstb0V34hYaxuYDZx5obYo0rsPl1659u5KD-s5IAYEuTitdJNT3uWLHgGqLPsd17GHMggQhSuvFIyTH1-mMG3PWF19Oqq0zuZMLw29XDjSDyNRxWauoFzaCzGvWbV2cXsBOob4iik92PPWVJw5BAy6PlK3GxB0ZlSq_Wxp3p0I33BHFxbU8LmbWnAdB-iClk',
            e: 'AQAB',
            d: 'Indul5MGBhbuw9v7ynK6D9v8yhEusR01YwjR57thfNrWc_xOUYwTtNYw7JejjeUheoPmwfUECBmqt0fOw85eV3-A8m_VRgYwCDnNd8QvYkfaqM-Sdep9iSKhDhemMLCwcgEf_0q2RilWBaPtpNLZJ570hlXY09YXt4JZdj_wrNtsWLGu2nVdjd1Zx9-kyDP8885GiQNTtf-A_HSUZX3-X8QCGmfU6KAFHuYcODS_kd-jFnEbsMeSAdom0kZKuTOhoM4YTueZH5gJ2_SohBYx99MB258_Ytr3OUs8vPE9moMMSB4h0vX_IC_JVHKxwn1cNyuob6cjg_W6y5vONoPQCTF7p8_S6BpTzHfxHVIIebaGd2KBqWO_WirUFZNOFa85DoQmhEw-tpKp7Ra1ckZAeBTrV2r5YwIN4YdVqfjJiuKH151-GVrbMssQeNtvCzH-QuoV5nV92D6jSjGSVUndxCcHBbLMZHr-27JW9bSVJ3LmJGR0vU5-yGZH1ViqiLNsjxBwfxD4N5Ga5MRT2e8hlyyrat3SZ8ZZ-IkoW8c4RwnUr9onk3sXCZhQOq9XESWt7HF6iJODRiDYe-AZVc4AVLAF5DPRmFKf8f3J6Rhfnyrue2qBS00DyhFyZGNbw_UaMk5tz1WYpFfcXHanZdB7LP0NnzWjGIgS-qVRaDXxNeE',
            p: '8gp6yLQ07LqGllcDW2uDgkfYPUO9VCZRv2Zi4gSuJfXQHCcdE9qxMMhybzERUAItcDTY78AgrT8s02B8vWVyFX7bcHrycLFoqc_jCkrIRdY1UDjdZxc-5Js-FCNVG_189yjRuvCXl43JuO2chao2m8ae7efnLA8Ka4axtI98luqcWVL5hZSeeEz6jKOo0Hk2pfgIqJABaJGhkTifhCITrH63IkwYRg4ShVTBkBFQ7IwJG2viK809LnryPtH-WPTeeaYovbo86STZwWOLPBW7KsYqcT_tRebW42PQtqNG8hmAjgLLGUMZVT1Ymdflnf7vX8UjrmYj5vpjnhM9EM0C_w',
            q: 'yV_VAdMEyb0UrUkv1E58sQxEGaaQ982RE11-YT-R6EXOjl6kR-XmTcBWkjzI4trvfQJXi8TUlahxxGiHYgYA56GRjR-CNBot_R_oTff7VWQDHwpQTyhd33cakpdHKgNqPiQ9zYKQom4bBwf8xENKIQQ1V9khtRGsl7q4rmx7lr4oJvLe9tCGSPVGvxs5NHbZLRSiQtQkoOBQ1S2QA68nD2o7CO0-oxJ-UDEzPoWcJJhtxRysE7aJtMPcQTWKApD3Tfs5aH8KtaWhoSlkLatqKOwPcjKpJAOKjUVCDedZbjx2j4ekJyY1aCV1eRz73XjiHcFcNnPuigXffx39wtjqpw',
            dp: 'G9MUlmoRA33V5waNvj632YxE0ZYt97SIBUbR60W6d2awy-u7LgMgB4mjjiDH6ri1XIbWwYkGuKPglVQsQuGcodf5hg68PDRI4eyiHxbFuzGK43QGD8neUw19r3b4W8ViTk-E_MaXxrZoEDhQnBUbPgExWAwmySvZeM79MtKj8f16h9JAGRkitpWy3-QYjg7BN4cyB562ar0DI9ysidYZCOVwTCMPT05i1q0Nq3AyK19V1K8sSvjHJcbAfnRJlxRfVwDBAj6crfish8zXvsqIv7wUOPyuXDDTV0SsQ7K1fzNrUegETR0nlmL9AoKNRQJ_pjTVi0D2s6DpPszbYkkPJQ',
            dq: 'gLiFTBk7Ikl_AhWaQTe6dOHGVi8m03_PkHVe54LfHX4hvte4Y00Nnf2oWOoJ7xjLpTjuBSXYTaHStx2qDHqR8X5Rr8fITs29P-Q5dj1hpv-7DwhktXS0LLfRgIq6rpxoOTipWMhw86M2G5R7emkY5WnvPyxIY5ncnVB55OTrSzxaJitxYouAivpeMqKQOn0N7ccWwWkh0MQSZ3IscG5xpWTeP6KHO24C1_fbLcfyO2JEKI9fX2p7M9VO4U_73BAWRP6lf6pVii9J1d7Dbn336hia9wBzJdYtpofy5ThQ7iowDydBQtUlpmDranOge71drG-BJj2M6SU_692b7AUEWQ',
            qi: '0-TUiGRoPBWatRlzSQIvwXs5zpGn20QfgmcGQD1LWnogWG-6QwfFsRWJ78FLEK69x35hBdcyzDNC5PzvBPXatr9_bL_Fv10qwMTkFwPOuDZHEzvb3-b_L3MD4JnQ6LbT8g36scv6aEgMNt9eeugRq0bR4xba1oj2pgjfVVKiENQWPlVYZ0HKYHAwdoss4d9x0dI1g-Gl426LreDz5RmDUgzdZ3nAfdnTrLUM69RTmAUjb_GfFWvmlBesFo-npv8qNToZRWmxEClXJZQCoxnzHx29bFe6WY5Jlt3zWCmI3o6LHQx6UiMrN-B_qE4T3plK0bS_w0x-Lbp9bhPbPE9AVA',
          },
        ],
      },
      timeout: 6000,
    },
    errorUriBase:
      'https://github.com/numerique-gouv/proconnect-documentation/blob/main/doc_fs/troubleshooting-fs.md',
  },
  OidcClient: {
    httpOptions: { timeout: 6000 },
    jwks: {
      keys: [
        {
          e: 'AQAB',
          n: '5OHMkVCg2xG2osiXbClpkW8YVxVeqPeQDrDZH1tiocf3S9kK1ErRP1oI1qwP3-MTZVp3O0NjO7eIkkqdogCl043vVty25KMk-lM-dAXfQFjSKBE5c2Y_mZbsvEyk885ZmEbb--S-lxZuBX1jWs574fOSsqKH5e5Mf_PjKgwZFOW0SFl6pGOp230Em5OfTbCN8AKMkw907b9DXoPocDcr3d3ZEa10f5OCI0aieTxvH5Jaq9ZMOQIj1-tTMpDecFYLO8REiQSsUp-4PLUbIBL2Iq-qwv6opkVetpiLR-wwz7e2Y_dDHCqnVHcCo_oWVFFRgKiL_dhmxFIpSkw4dc1ICQ',
          d: 'vZepC6o9RJo8rkT44XjAYN8ky2YBPnerVe_6OrZJUnfBCowkI0xCXnbnIWPv1mZT973jTCz680mJkJzMTJi6xC4rVsmHmoblp5HzBsqibrvkgZoa-9Nz1XcmbKgUb3y7zJ7NtK97jM3gnx2JgnvONJG-L8jgR3-I0OimgHr6_8nh8Qv66at8fighlefmIp-2UVYPydKp2pi9drQAWFAYW5hgNCcmuMi8814O4hdm3zsJU6w8cwOLf2p_L3No9YonO2GcSO_ZRHqPqdj5lDwtBR2DbYAUpzOYj0FMPoG6MMM6ITK9DgHDtwVuoo6ZxI6aoAMCYZ8zehn9QuACtZZQPQ',
          p: '8l1JmRGOfMMxlqFaAB9sWFe29P4xIVl5Tez95Hf9qIIlcdNvrm6bep5889sMAfN3LB2NA09rwBdCPdjVT_80XgrxTsxPPOvzmxuHmHaozlkBAAgfNgIASgKaznSf8nbBkp-p6NRIc3JOCJDFopm6C43ZCexBu8or_CK554O8AMM',
          q: '8cJUELj52DDYoxcGsm6wIyk9QYCIRry3gxJwaHWQt4xTeX65_W27x0WVY4ZXNCIYYMxKQXN5Ud70OsdzExNHk9dn96w2cOT2tKlIixoSyDpbLsYKuQ4KlEz0S2GZJyiAT0C2N_1VlRy_OFAFmauj9SIMm3Wr3UhWa7fWRWThR0M',
          dp: 'Rs_SzRJAG1u8hVInRZnowfb-0Z3jJOdLdeUkWThluHIuFo-8Na7DZpQf1e_OFlPYId-Qb8MorDsfc4qC6Jib6E4yKt-u1xHpXwwwFe-1anS-wg-dbt4uz3DrYh7ZDLJ95CUaM5iygmiHPCFwXQ2lOfL70tZgbkmniEdtIaNvrpk',
          dq: 'vkXv2-l52kk3d8SbpLuxLTs71t3OY74LwME2b0B4Ub3DxQ-UWn2PGNsPJHGLGKDtBuJCXxj_Fwyes9ReIVk_MICMd0W240uRT8ccLT6sIaKsOTftIJCIiwe2Dc4Wt9cMhVOtFovwW5dweGWiwrtwI3JU8dW_Gj3gpo7duWgYVfk',
          qi: 'Cpf7tVogmGoFr-WTWSkctb0KqNtNCY3tU__2b2GI0uW_a9TafQhU8fon4SNBPlicdAYlgO1q23tklyhGpLbw7qYgHkr-zt-v_Vfg5YP8cZYGEqW52Qjl2HeMlCCI0-38RG3wFYwXjGDZk9YW6VAWlc6i1MSLrd7NGRrwH1ZkD7U',
          kty: 'RSA',
          alg: 'RSA-OAEP',
          kid: 'oidc-provider:locale',
          use: 'enc',
        },
      ],
    },
    stateLength: 32,
    scope:
      'openid uid given_name usual_name email siren siret organizational_unit belonging_population phone chorusdt',
    fapi: false,
    postLogoutRedirectUri:
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
    redirectUri:
      'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback',
  },
  Mongoose: {
    user: 'fc',
    password: 'pass',
    hosts: 'mongo-fca-low:27017',
    database: 'core-fca-low',
    options: {
      authSource: 'core-fca-low',
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsCAFile: '/etc/ssl/docker_host/docker-stack-ca.crt',
      tlsAllowInvalidHostnames: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    watcherDebounceWaitDuration: 0,
  },
  Redis: {},
  ServiceProviderAdapterMongo: {
    clientSecretEncryptKey: 'JZBlwxfKnbn/RV025aw+dQxk+xoQT+Yr',
  },
  IdentityProviderAdapterMongo: {
    clientSecretEncryptKey: 'JZBlwxfKnbn/RV025aw+dQxk+xoQT+Yr',
    decryptClientSecretFeature: true,
  },
  Session: {
    encryptionKey: 'raePh3i+a4eiwieb-H5iePh6o/gheequ',
    prefix: 'FCA-LOW-SESS:',
    cookieOptions: {
      signed: true,
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
      maxAge: 43200000,
    },
    cookieSecrets: [
      'yahvaeJ0eiNua6te',
      'lidubozieKadee7w',
      'Eigoh6ev8xaiNoox',
      'veed7Oow7er5Saim',
    ],
    sessionCookieName: 'pc_session_id',
    lifetime: 43200,
    sessionIdLength: 64,
    slidingExpiration: false,
    middlewareExcludedRoutes: [],
    middlewareIncludedRoutes: [
      '/authorize',
      '/interaction/:uid$',
      '/redirect-to-idp',
      '/oidc-callback',
      '/interaction/:uid/verify',
      '/login',
      '/identity-provider-selection',
      '/client/disconnect-from-idp',
      '/client/logout-callback',
    ],
    templateExposed: { User: { spName: true, idpName: true } },
    schema: CoreFcaSession,
    defaultData: { User: {}, Csrf: {}, FlowSteps: {} },
  },
};
