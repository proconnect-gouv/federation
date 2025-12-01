# ProConnect - Fédération

La solution qui vous identifie en tant que professionnel.

[Plus d'information](https://github.com/numerique-gouv/proconnect-documentation?tab=readme-ov-file#-proconnect---documentation).

## Overview

This repository contains 3 main folders:

- docker: the custom docker environnement called "docker stack"
- back: the Node.js source code
- quality: the end-to-end tests

## Installation Guide

This guide provides steps to run the ProConnect Fédération within a custom docker environnement called "docker stack".

## Prerequisites

- Node.js (v22) installed (we suggest the usage of [nvm](https://github.com/nvm-sh/nvm))
- Yarn (>= 1.22) installed ([doc](https://yarnpkg.com/getting-started/install))
- Docker (>= v20.04) and Docker Compose (>= v2.0) installed ([doc](https://docs.docker.com/engine/install/))

### Under OS X

```bash
brew install bash
brew install coreutils
```

Install the latest version of bash.
Install coreutils gives you access to the timeout function.

## Setup the working environment

Now we will set up the working environment for the docker-stack.

- Add the following lines to your `~/.bashrc`:

```bash
# change /path/to/france/connect/workspace/ by actual path to your working directory:
export PC_ROOT=/path/to/proconnect/workspace/

# Workaround for UnixHTTPConnectionPool(host='localhost', port=None): Read timed out. (read timeout=70) :
export COMPOSE_HTTP_TIMEOUT=200

# Makes cypress aware of root path, not having to create relative path from e2E test file
export CYPRESS_PC_ROOT=$PC_ROOT

# Setup the docker registry url (for now, we still continue to use the ProConnect container registry)
export PC_DOCKER_REGISTRY=ghcr.io/proconnect-gouv/federation

# Alias for the docker-stack command (you can add it to your "~/.bash_aliases" if you prefer but don't forget to set the variables before the .bash_aliases sourcing in your .bashrc 😉) :
alias dks=$PC_ROOT/federation/docker/docker-stack
```

- Clone the repository

```bash
mkdir -p $PC_ROOT && cd $PC_ROOT

git clone git@github.com:proconnect-gouv/federation.git
```

## Run the application

### Running ProConnect Fédération

```bash
dks switch small
```

On https://fsa1-low.docker.dev-franceconnect.fr/, you can test the connexion with: `test@fia1.fr`

You are now connected to fsa1!

### Running PCF Admin

ProConnect Federation Admin was formerly named fc-exploitation.

Start it with:

```bash
dks switch medium
```

Then go to https://exploitation-fca-low.docker.dev-franceconnect.fr/login.

Login with:

- Username: `jean_moust`
- Password: `georgesmoustaki`
- TOTP: enter this secret in your totp app `KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD`

More credentials can be found here : `federation-admin/shared/fixtures/User.yml`.

### Testing the installation

You will then find a list of accessible URLs here: https://hello.docker.dev-franceconnect.fr.

Most URLs follow the same pattern <app-name>.docker.dev-franceconnect.fr

On any URL, if you got a 502, it might still be booting, wait one minute, then reload.

## Get the logs

File based logs are stored here:

```
federation/docker/volumes/log
```

You can read them with:

```bash
tail -F $PC_ROOT/federation/docker/volumes/log/* | npx pino-pretty
```

Other logs are outputted in stdout. You can read them with, for example:

```bash
docker compose logs core -f --no-log-prefix | npx pino-pretty
```

### Restart a single container

By default, only the core-fca service runs in watch mode.
To apply changes to either the idp, sp or data provider, execute the following command:

```bash
dks start fia1-low
```

You might also need to restart the reverse proxy:

```
dks compose restart rp-all
```

### Halt the stack

```bash
dks halt
```

### Cleanup installation

```bash
dks compose down --volumes --remove-orphans --rmi all
```

### See Usages

```bash
dks help
```

## Run the unit tests

These tests are included directly in source code rather than in a dedicated test folder.

### Check coverage

ProConnect expects 100% code coverage. You can test the coverage using the following commands.

```bash
cd $PC_ROOT/federation/back
yarn test --coverage --maxWorkers=50%
cd $PC_ROOT/federation/admin
yarn test
```

If you want to check the coverage for a single file:

```bash
yarn test:cov --collectCoverageFrom=path/to/file.ts path/to/file.spec.ts
```

### Run the tests without coverage

To execute the unit tests faster, you can run them without coverage.

```bash
yarn test
```

## Run the quality Tests

### Prerequisites

```bash
cd $PC_ROOT/federation/quality/fca
yarn install --frozen-lockfile
```

### Run tests from the Cypress UI

```bash
dks switch medium
cd $PC_ROOT/federation/quality/fca
yarn start:low
```

### Run tests for PCF Admin from the Cypress UI

```bash
dks switch medium
cd $PC_ROOT/federation/admin
yarn test:e2e:open
```

### Run all quality tests for PCF Core

```bash
dks switch medium
cd $PC_ROOT/federation/quality/fca
yarn test:low:chrome-desktop --env TAGS='not @hybridge and not @ignore'
```

### Run all quality tests for PCF Hybridge

```bash
dks switch hybridge
cd $PC_ROOT/federation/quality/fca
yarn test:low:chrome-desktop --env TAGS='@hybridge'
```

## Visualization Tests

```bash
dks switch small
cd $PC_ROOT/federation/quality/fca
yarn test:low:snapshot
```

## Run other tests

```bash
cd $PC_ROOT/federation/quality/fca
yarn lint --fix
yarn prettier --write
cd $PC_ROOT/federation/back
yarn static
cd $PC_ROOT/federation/admin
yarn lint --fix
```

## Run test against integ01 env

```bash
cd $PC_ROOT/federation/quality/fca
# Get the credentials from a team member
CYPRESS_TEST_ENV=integ01 CYPRESS_EXPLOIT_USER_NAME=proconnect-test-local CYPRESS_EXPLOIT_USER_PASS='xxx' CYPRESS_EXPLOIT_USER_TOTP='xxx' yarn start:low
```

## Add a migration script

We use [migrate-mongo](https://www.npmjs.com/package/migrate-mongo) to manage the database migrations.

```bash
# in the back directory
$ yarn run migrate create "blacklist the beatles"
Created: migrations/20250203153126-blacklist_the_beatles.ts
Done in 0.25s.
```

> [!NOTE]  
> The generated file does really match our code style and might not be very TypeScript friendly.  
> Feel free to change it to guaranty type safety.  
> The files will run with [`NODE_OPTIONS="--experimental-strip-types"`](https://nodejs.org/docs/latest-v22.x/api/cli.html#--experimental-strip-types) for a year (2024) as Node.js 24 is will have this option active by default.

## Run the migration script on the mongo container

We use init containers to run the migration script on the mongo container.  
To run `core-fca-low` migration script, run:

```bash
$ docker compose run --rm init-core
```

> [!NOTE]  
> This `init-core-fca-low` container is a dependency of the `core-fca-low` container.  
> It will run the migration script every time the `core-fca-low` container is started.  
> No need to do it manually when using the `dks switch`

## Generate a new version of class-validator-0.14.2

We forked the class-validator package because we needed inhertiance features and is not yet merged [into the main branch](https://github.com/typestack/class-validator/pull/2641).

To update the package, follow these steps.

Get and update the project:

```bash
git clone git@github.com:proconnect-gouv/class-validator.git
```

Update the version attribute of `class-validator/package.json`:

```json
{
  "name": "class-validator",
  "version": "0.14.2-proconnect.1",
  "...": "..."
}
```

Build the new package:

```bash
rm -rf build
npm ci --ignore-scripts
npm run prettier:check
npm run lint:check
npm run test:ci
npm run build:es2015
npm run build:esm5
npm run build:cjs
npm run build:umd
npm run build:types
cp LICENSE build/LICENSE
cp README.md build/README.md
jq 'del(.devDependencies) | del(.scripts)' package.json > build/package.json
npm pack ./build
```

Then push the built package in a dedicated branch:

```bash
git checkout -b build-0.14.2-proconnect.1
find . -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name '.idea' \
  ! -name '.gitignore' \
  ! -name 'build' \
  -exec rm -rf {} +
mv build/* .
rmdir build
git add .
git commit -m "Build version 0.14.2-proconnect.1"
git push
```

Update `federation/back/package.json`:

```json
{
  "dependencies": {
    "class-validator": "git+https://github.com/proconnect-gouv/class-validator.git#build-0.14.2-proconnect.1"
  }
}
```

Run yarn install.
