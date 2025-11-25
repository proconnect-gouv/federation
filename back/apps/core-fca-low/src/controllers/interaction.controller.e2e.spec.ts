import * as request from 'supertest';

import { TestingBench } from '@fc/core/test-bench';
import { OidcClientIssuerService } from '@fc/oidc-client';

import {
  createIdentityProvider,
  Fia1IdentityProviderDocument,
  MonCompteProIdentityProviderDocument,
} from '@mocks/identity-provider-adapter-mongo';
import {
  createMockOidcClientIssuerService,
  Fia1MockIssuerConfig,
  MonCompteProMockIssuerConfig,
} from '@mocks/oidc-client';
import {
  createServiceProvider,
  Fsa1ServiceProviderDocument,
} from '@mocks/service-provider-adapter-mongo';

import { SessionBuilder } from '../../.mocks/session';

const interactionUidPattern = new RegExp('/api/v2/interaction/([^/?]+)$');
const authorizeUidPattern = new RegExp('/authorize/([^/?]+)$');

describe('InteractionController', () => {
  describe('GET /', () => {
    it('should redirect to the configured defaultRedirectUri', async () => {
      await using bench = await TestingBench.createTestBench();
      const { app } = bench;

      await request(app.getHttpServer())
        .get('/')
        .expect(301)
        .expect('Location', 'https://www.proconnect.gouv.fr');
    });
  });

  describe('GET /interaction/:uid', () => {
    const interaction = {
      uid: '1234567890-1234567890',
      params: {
        client_id: Fsa1ServiceProviderDocument.key,
        state: 'test-state',
        scope: 'openid email',
      },
      prompt: {
        name: 'login',
        reasons: [],
      },
    };

    it('should render the interaction page', async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        'OIDC-P:Interaction:1234567890-1234567890',
        JSON.stringify(interaction),
      );

      await request(app.getHttpServer())
        .get('/interaction/1234567890-1234567890')
        .set('Cookie', '_interaction=1234567890-1234567890')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(({ text }) => {
          expect(text).toContain('Choix du compte - ProConnect');
          expect(text).toContain('Se connecter à FSA - FSA1-LOW');
        });
    });

    it('should redirect to hinted fia1 identity provider', async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(OidcClientIssuerService)
          .useValue(createMockOidcClientIssuerService(Fia1MockIssuerConfig)),
      );
      const { app } = bench;

      await createIdentityProvider(app, MonCompteProIdentityProviderDocument);
      await createIdentityProvider(app, Fia1IdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      const agent = request.agent(app.getHttpServer());

      const authorizeResponse = await agent
        .get('/authorize')
        .query({
          client_id: Fsa1ServiceProviderDocument.key,
          redirect_uri:
            'https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback',
          state: 'test-state',
          scope: 'openid email',
          response_type: 'code',
          idp_hint: Fia1IdentityProviderDocument.uid,
        })
        .expect(303);

      expect(authorizeResponse.headers.location).toMatch(interactionUidPattern);
      const interactionUid = authorizeResponse.headers.location
        .match(interactionUidPattern)
        .at(1);
      expect(interactionUid).toBeTruthy();

      const interactionResponse = await agent.get(
        `/interaction/${interactionUid}`,
      );

      expect(interactionResponse.status).toBe(302);
      expect(interactionResponse.headers.location).toContain(
        `https://fia1-low.docker.dev-franceconnect.fr/api/v2/authorize?client_id=${Fia1IdentityProviderDocument.clientID}`,
      );
    });

    it('should redirect to /interaction/:uid/verify', async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(OidcClientIssuerService)
          .useValue(createMockOidcClientIssuerService(Fia1MockIssuerConfig)),
      );
      const { app } = bench;

      await createIdentityProvider(app, Fia1IdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      const agent = request.agent(app.getHttpServer());

      const authorizeResponse = await agent
        .get('/authorize')
        .query({
          client_id: Fsa1ServiceProviderDocument.key,
          redirect_uri:
            'https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback',
          state: 'test-state',
          scope: 'openid email',
          response_type: 'code',
          idp_hint: Fia1IdentityProviderDocument.uid,
        })
        .expect(303);

      const interactionUid = authorizeResponse.headers.location
        .match(interactionUidPattern)
        .at(1);
      expect(interactionUid).toBeTruthy();

      const sessionRef = SessionBuilder.create()
        .withInteractionId(interactionUid)
        .withIdTokenClaims({ acr: 'eidas1', amr: ['pwd'] })
        .withServiceProvider(Fsa1ServiceProviderDocument)
        .withIdentityProvider(Fia1IdentityProviderDocument)
        .withUserInfo({
          sub: '1234567890',
          given_name: 'Test',
          usual_name: 'User',
          email: 'test@example.com',
          uid: '1234567890',
          siren: '130025265',
          siret: '13002526500013',
          organizational_unit: 'Test Org',
          belonging_population: 'test_pop',
        });

      const response = await agent
        .get(`/interaction/${interactionUid}`)
        .set(
          'Cookie',
          `_interaction=${interactionUid}; pc_session_id=${await sessionRef.buildSignedSessionCookie(app)}`,
        )
        .expect(302);

      expect(response.headers.location).toContain(
        `/api/v2/interaction/${interactionUid}/verify`,
      );
    });

    it('should abort interaction when idp_hint is not found', async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      const agent = request.agent(app.getHttpServer());

      const authorizeResponse = await agent
        .get('/authorize')
        .query({
          client_id: Fsa1ServiceProviderDocument.key,
          redirect_uri:
            'https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback',
          state: 'test-state',
          scope: 'openid email',
          response_type: 'code',
          idp_hint: 'non-existent-idp-id',
        })
        .expect(303);

      expect(authorizeResponse.headers.location).toMatch(interactionUidPattern);
      const interactionUid = authorizeResponse.headers.location
        .match(interactionUidPattern)
        .at(1);

      const response = await agent
        .get(`/interaction/${interactionUid}`)
        .expect(303);

      expect(response.headers.location).toMatch(authorizeUidPattern);
      expect(response.headers.location).toContain(interactionUid);

      expect(
        JSON.parse(await redis.get(`OIDC-P:Interaction:${interactionUid}`))
          .result,
      ).toEqual({
        error: 'idp_hint_not_found',
        error_description: 'provided idp_hint could not be found',
      });

      const {
        headers: { location: authorizeUidResponseLocation },
      } = await agent
        .get(new URL(response.headers.location).pathname)
        .expect(303);

      const callbackUrl = new URL(authorizeUidResponseLocation);
      expect(callbackUrl.origin + callbackUrl.pathname).toBe(
        'https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback',
      );
      expect(Object.fromEntries(callbackUrl.searchParams)).toEqual({
        error: 'idp_hint_not_found',
        error_description: 'provided idp_hint could not be found',
        state: 'test-state',
        iss: 'https://core-fca-low.docker.dev-franceconnect.fr/api/v2',
      });
    });

    it('should redirect to IdP with login_hint when no IdP hint', async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(OidcClientIssuerService)
          .useValue(
            createMockOidcClientIssuerService(MonCompteProMockIssuerConfig),
          ),
      );
      const { app } = bench;

      await createIdentityProvider(app, MonCompteProIdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      const agent = request.agent(app.getHttpServer());

      const authorizeResponse = await agent
        .get('/authorize')
        .query({
          client_id: Fsa1ServiceProviderDocument.key,
          redirect_uri:
            'https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback',
          state: 'test-state',
          scope: 'openid email',
          response_type: 'code',
          login_hint: 'user@moncomptepro.fr',
        })
        .expect(303);

      expect(authorizeResponse.headers.location).toMatch(interactionUidPattern);
      const interactionUid = authorizeResponse.headers.location
        .match(interactionUidPattern)
        .at(1);
      expect(interactionUid).toBeTruthy();

      const interactionResponse = await agent.get(
        `/interaction/${interactionUid}`,
      );

      expect(interactionResponse.status).toBe(302);
      expect(interactionResponse.headers.location).toContain(
        'moncomptepro.docker.dev-franceconnect.fr',
      );
    });
  });

  describe('GET /interaction/:uid/verify', () => {
    const interaction = {
      uid: 'verify-test-uid123456',
      params: {
        client_id: Fsa1ServiceProviderDocument.key,
        redirect_uri:
          'https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback',
        state: 'test-state',
        scope: 'openid email',
        response_type: 'code',
      },
      prompt: {
        name: 'login',
        reasons: [],
      },
    };

    const userInfo = {
      sub: '1234567890',
      given_name: 'Test',
      usual_name: 'User',
      email: 'test@example.com',
      uid: '1234567890',
      siren: '130025265',
      siret: '13002526500013',
      organizational_unit: 'Test Org',
      belonging_population: 'test_pop',
    };

    it('should accept valid session and attempt to finish interaction', async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await createIdentityProvider(app, Fia1IdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        'OIDC-P:Interaction:verify-test-uid123456',
        JSON.stringify({
          ...interaction,
          returnTo:
            'http://localhost:3000/auth/callback?interactionId=verify-test-uid123456',
        }),
      );

      const sessionRef = SessionBuilder.create()
        .withInteractionId('verify-test-uid123456')
        .withServiceProvider(Fsa1ServiceProviderDocument)
        .withIdentityProvider(Fia1IdentityProviderDocument)
        .withUserInfo(userInfo)
        .withIdTokenClaims({ acr: 'eidas1', amr: ['pwd'] });

      const response = await request(app.getHttpServer())
        .get('/interaction/verify-test-uid123456/verify')
        .set(
          'Cookie',
          `_interaction=verify-test-uid123456; pc_session_id=${await sessionRef.buildSignedSessionCookie(app)}`,
        )
        .expect(303);

      expect(response.headers).toEqual({
        'cache-control': 'no-store',
        connection: 'close',
        'content-length': '0',
        date: expect.any(String),
        location:
          'http://localhost:3000/auth/callback?interactionId=verify-test-uid123456',
        'x-powered-by': 'Express',
      });
    });

    it('should redirect back to /interaction when IdP is inactive', async () => {
      await using bench = await TestingBench.createTestBench();

      const { app, redis } = bench;

      const inactiveIdp = { ...Fia1IdentityProviderDocument, active: false };
      await createIdentityProvider(app, inactiveIdp);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        'OIDC-P:Interaction:verify-test-uid123456',
        JSON.stringify(interaction),
      );

      const sessionRef = SessionBuilder.create()
        .withInteractionId('verify-test-uid123456')
        .withServiceProvider(Fsa1ServiceProviderDocument)
        .withIdentityProvider(inactiveIdp)
        .withUserInfo(userInfo)
        .withIdTokenClaims({ acr: 'eidas1', amr: ['pwd'] });

      const response = await request(app.getHttpServer())
        .get('/interaction/verify-test-uid123456/verify')
        .set(
          'Cookie',
          `_interaction=verify-test-uid123456; pc_session_id=${await sessionRef.buildSignedSessionCookie(app)}`,
        )
        .expect(302);

      expect(response.headers).toEqual({
        'cache-control': 'no-store',
        connection: 'close',
        'content-length': '63',
        'content-type': 'text/plain; charset=utf-8',
        date: expect.any(String),
        location: '/api/v2/interaction/verify-test-uid123456',
        vary: 'Accept',
        'x-powered-by': 'Express',
      });
    });

    it('should reject private sector identity for public-only service provider', async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await createIdentityProvider(app, Fia1IdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        'OIDC-P:Interaction:verify-test-uid123456',
        JSON.stringify(interaction),
      );

      const sessionRef = SessionBuilder.create()
        .withInteractionId('verify-test-uid123456')
        .withServiceProvider(Fsa1ServiceProviderDocument)
        .withIdentityProvider(Fia1IdentityProviderDocument)
        .withUserInfo({
          ...userInfo,
          is_service_public: false,
        })
        .withIdTokenClaims({ acr: 'eidas1', amr: ['pwd'] });

      const response = await request(app.getHttpServer())
        .get('/interaction/verify-test-uid123456/verify')
        .set(
          'Cookie',
          `_interaction=verify-test-uid123456; pc_session_id=${await sessionRef.buildSignedSessionCookie(app)}`,
        )
        .expect(400);

      expect(response.headers).toMatchObject({
        'cache-control': 'no-store',
        connection: 'close',
        'content-type': 'text/html; charset=utf-8',
        'x-powered-by': 'Express',
      });
      expect(response.text).toContain(
        "L'accès à ce site est limité aux agentes et agents représentant officiellement une administration publique.",
      );
      expect(response.text).toContain(
        'Le SIRET associé à votre organisation correspond à une structure de droit privé et ne permet donc pas l’accès.',
      );
    });

    it('should abort interaction when ACR cannot be satisfied', async () => {
      await using bench = await TestingBench.createTestBench();
      const { app, redis } = bench;

      await createIdentityProvider(app, Fia1IdentityProviderDocument);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        'OIDC-P:Interaction:verify-test-uid123456',
        JSON.stringify({
          ...interaction,
          returnTo: '/authorize/verify-test-uid123456',
        }),
      );

      const agent = request.agent(app.getHttpServer());

      const sessionRef = SessionBuilder.create()
        .withInteractionId('verify-test-uid123456')
        .withServiceProvider(Fsa1ServiceProviderDocument)
        .withIdentityProvider(Fia1IdentityProviderDocument)
        .withUserInfo({
          sub: '1234567890',
          given_name: 'Test',
          usual_name: 'User',
          email: 'test@example.com',
          uid: '1234567890',
          siret: '13002526500013',
        })
        .withIdTokenClaims({ acr: 'eidas1', amr: ['pwd'] })
        .set('User.spEssentialAcr', 'eidas3'); // Override to request eidas3

      const response = await agent
        .get('/interaction/verify-test-uid123456/verify')
        .set(
          'Cookie',
          `_interaction=verify-test-uid123456; pc_session_id=${await sessionRef.buildSignedSessionCookie(app)}`,
        )
        .expect(303);

      expect(response.headers.location).toBe(
        '/authorize/verify-test-uid123456',
      );
    });

    it('should abort interaction when IdP is inactive during silent authentication', async () => {
      await using bench = await TestingBench.createTestBench((builder) =>
        builder
          .overrideProvider(OidcClientIssuerService)
          .useValue(createMockOidcClientIssuerService(Fia1MockIssuerConfig)),
      );
      const { app, redis } = bench;

      const inactiveIdp = { ...Fia1IdentityProviderDocument, active: false };
      await createIdentityProvider(app, inactiveIdp);
      await createServiceProvider(app, Fsa1ServiceProviderDocument);

      await redis.set(
        'OIDC-P:Interaction:silent-auth-uid123456',
        JSON.stringify({
          uid: 'silent-auth-uid123456',
          params: {
            client_id: Fsa1ServiceProviderDocument.key,
            redirect_uri:
              'https://fsa1-low.docker.dev-franceconnect.fr/oidc-callback',
            state: 'test-state',
            scope: 'openid email',
            response_type: 'code',
            prompt: 'none',
          },
          prompt: { name: 'login', reasons: [] },
          returnTo:
            'http://localhost:3000/auth/callback?interactionId=silent-auth-uid123456',
        }),
      );

      const sessionRef = SessionBuilder.create()
        .withInteractionId('silent-auth-uid123456')
        .withServiceProvider(Fsa1ServiceProviderDocument)
        .withIdentityProvider(inactiveIdp)
        .withUserInfo({
          sub: '1234567890',
          given_name: 'Test',
          usual_name: 'User',
          email: 'test@example.com',
          uid: '1234567890',
          siret: '13002526500013',
        })
        .withIdTokenClaims({ acr: 'eidas1', amr: ['pwd'] })
        .set('User.isSilentAuthentication', true); // Set silent auth flag

      const agent = request.agent(app.getHttpServer());

      const response = await agent
        .get('/interaction/silent-auth-uid123456/verify')
        .set(
          'Cookie',
          `_interaction=silent-auth-uid123456; pc_session_id=${await sessionRef.buildSignedSessionCookie(app)}`,
        )
        .expect(303);

      expect(response.headers.location).toContain(
        'http://localhost:3000/auth/callback',
      );
      expect(response.headers.location).toContain(
        'interactionId=silent-auth-uid123456',
      );
    });
  });
});
