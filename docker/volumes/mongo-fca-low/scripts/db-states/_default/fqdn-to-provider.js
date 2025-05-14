const fqdnToProviders = [
  {
    fqdn: 'fia1.fr',
    identityProvider: '9c716f61-b8a1-435c-a407-ef4d677ec270',
    acceptsDefaultIdp: true,
  },
  {
    fqdn: 'fia2.fr',
    identityProvider: '0e7c099f-fe86-49a0-b7d1-19df45397212',
    acceptsDefaultIdp: true,
  },
  {
    fqdn: 'fia3.fr',
    identityProvider: 'b61f31b8-c131-40d0-9eca-109219249db6',
    acceptsDefaultIdp: true,
  },
  {
    fqdn: 'moncomptepro.fr',
    identityProvider: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
    acceptsDefaultIdp: true,
  },
  // an example of fqdn linked to more than one idp (fia1 and fia2)
  {
    fqdn: 'polyfi.fr',
    identityProvider: '9c716f61-b8a1-435c-a407-ef4d677ec270',
    acceptsDefaultIdp: true,
  },
  {
    fqdn: 'polyfi.fr',
    identityProvider: '0e7c099f-fe86-49a0-b7d1-19df45397212',
    acceptsDefaultIdp: true,
  },
  // an example of fqdn linked to more than one idp (fia1 and fia2)
  {
    fqdn: 'polyfi2.fr',
    identityProvider: '9c716f61-b8a1-435c-a407-ef4d677ec270',
    acceptsDefaultIdp: false,
  },
  {
    fqdn: 'polyfi2.fr',
    identityProvider: '46f5d9f9-881d-46b1-bdcc-0548913ea443',
    acceptsDefaultIdp: false,
  },
  // by default we use abcd.com fqdn and fia1-low provider
  {
    fqdn: 'abcd.com',
    identityProvider: '9c716f61-b8a1-435c-a407-ef4d677ec270',
    acceptsDefaultIdp: true,
  },
  {
    fqdn: 'fi-rie.fr',
    identityProvider: 'c6ecab5e-dc67-4390-af57-fe208e97b649',
    acceptsDefaultIdp: true,
  },
];

print('Initializing fqdnToProvider collection');
db.provider.update(fqdnToProviders, {
  upsert: true,
});

fqdnToProviders.forEach((fqdnToProvider) => {
  print(`Initializing fqdnToProvider :: ${JSON.stringify(fqdnToProvider)}`);

  db.fqdnToProvider.update(fqdnToProvider, fqdnToProvider, { upsert: true });
});
