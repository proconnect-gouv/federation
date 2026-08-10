print("Initializing Service Providers...");
load("/opt/scripts/db-states/_default/service-providers.js");

/* ------------------------------------------------------------------------------- */

print("Initializing Identity Providers...");
load("/opt/scripts/db-states/_default/identity-providers.js");

/* ------------------------------------------------------------------------------- */

print("Initializing FCA ACCOUNTS...");
load("/opt/scripts/db-states/_default/account-fca.js");

/* ------------------------------------------------------------------------------- */

print("Initializing Scopes...");
load("/opt/scripts/db-states/_default/scopes.js");

/* ------------------------------------------------------------------------------- */

print("Initializing Resource Servers...");
load("/opt/scripts/db-states/_default/resource-servers.js");
