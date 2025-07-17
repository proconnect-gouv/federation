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
export PC_DOCKER_REGISTRY= ghcr.io/proconnect-gouv/federation

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

Logs are stored here:

```
federation/docker/volumes/log
```

You can output them with:

```
tail -F $PC_ROOT/federation/docker/volumes/log/* | npx pino-pretty
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
git clean -nxd # check the file list, if ok, launch the next command
git clean -fxd
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
yarn install
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
cd $PC_ROOT/federation/admin/fc-exploitation
yarn test:e2e:open
```

## Visualization Tests

```bash
dks switch medium
cd $PC_ROOT/federation/quality/fca
yarn test:low:snapshot
```

## Run other tests

```bash
cd $PC_ROOT/federation/quality/fca
yarn lint --fix
yarn prettier --write
cd $PC_ROOT/federation/back
yarn doc
yarn lint --fix
yarn prettier --write
yarn tsc --noEmit
cd $PC_ROOT/federation/admin
yarn lint --fix
```

## Run test against integ01 env

```bash
cd $PC_ROOT/federation/quality/fca
# Get the credentials from a team member
CYPRESS_TEST_ENV=integ01 CYPRESS_EXPLOIT_USER_NAME=proconnect-test-local CYPRESS_EXPLOIT_USER_PASS='xxx' CYPRESS_EXPLOIT_USER_TOTP='xxx' yarn start:low
```
