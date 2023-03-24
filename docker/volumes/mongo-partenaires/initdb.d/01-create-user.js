db.getSiblingDB('admin').auth('rootAdmin', 'pass');

/* ------------------------------------------------------------------------------- */

print('Creating Mongo FCP-LOW User');
db.createUser({
  user: 'partenaires',
  pwd: 'pass',
  roles: [
    { role: 'dbOwner', db: 'partenaires' },
    { role: 'readWrite', db: 'partenaires' },
  ],
});

/* ------------------------------------------------------------------------------- */

rs.status();
