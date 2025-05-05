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

- Clone every needed repository

```bash
mkdir -p $PC_ROOT && cd $PC_ROOT

# The main repository
git clone git@github.com:proconnect-gouv/federation.git

# Back office app
git clone git@github.com:proconnect-gouv/federation-admin.git
```

- Link the cloned repository in the docker volumes

```bash
cd $PC_ROOT/federation/docker/volumes/src
ln -s $PC_ROOT/federation
ln -s $PC_ROOT/federation-admin
```

- pull FC docker images, you will need to authenticate against the FC docker registry:

```bash
docker login $PC_DOCKER_REGISTRY
```

You will be prompted for:

- a username: use your github.com/proconnect-gouv/federation username
- a password: as two-factor authentication is mandatory, you'll need to create an access token with only "read_registry" permission from your account settings: https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html. If you are not from the internal team, please ask an FC for one through support.

## Run the application

### Running AgentConnect

```bash
dks switch small
```

On https://fsa1-low.docker.dev-franceconnect.fr/, you can test the connexion with :

- On the AgentConnect page use this email: `test@fia1.fr`
- Change the login to: `test`
- Leave the password empty

You are now connected to fsa1!

### Running FC exploitation for AgentConnect

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

On any URL, if you got a 502, it might still be booting, wait one minute then reload.

## Get the logs

The logger outputs JSON that can be read in Chrome DevTools.

- in Chrome, go to chrome://inspect/#devices
- "Discover network target": click on "Configure"
- enters "localhost:6666" (or the corresponding url logged when you started the stack)
- click on inspect

Alternatively, you can use `dks log core-fca-low`.

### Restart a single container

By default, only the core-fca service runs in watch mode.
To apply changes to either the idp, sp or data provider, execute the following command:

```bash
dks start fia1-low
```

### Halt the stack

```bash
dks halt
```

### See Usages

```bash
dks help
```

## Run the integration tests

These tests are included directly in source code rather than in a dedicated test folder.

```bash
cd $PC_ROOT/federation/back
yarn test --coverage --maxWorkers=50%
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

## Visualization Tests

```bash
dks switch medium
cd $PC_ROOT/federation/quality/fca
yarn test:low:snapshot
```

## Run static tests

```bash
cd $PC_ROOT/federation/quality/fca
yarn lint --fix
yarn prettier --write
cd $PC_ROOT/federation/back
yarn doc
yarn lint --fix
yarn prettier --write
yarn tsc --noEmit
```
