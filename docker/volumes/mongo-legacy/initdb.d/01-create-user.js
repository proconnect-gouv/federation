db.getSiblingDB('admin').auth('rootAdmin', 'pass');

/* ------------------------------------------------------------------------------- */

print('Creating Mongo legacy User');
db.createUser({
  user: 'core-legacy',
  pwd: 'pass',
  roles: [
    { role: 'dbOwner', db: 'core-legacy' },
    { role: 'readWrite', db: 'core-legacy' },
  ],
});

/* ------------------------------------------------------------------------------- */

rs.status();
