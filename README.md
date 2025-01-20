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
export FC_ROOT=/path/to/france/connect/workspace/

# Workaround for UnixHTTPConnectionPool(host='localhost', port=None): Read timed out. (read timeout=70) :
export COMPOSE_HTTP_TIMEOUT=200

# Makes cypress aware of root path, not having to create relative path from e2E test file
export CYPRESS_FC_ROOT=$FC_ROOT

# Setup the docker registry url
export FC_DOCKER_REGISTRY=registry.gitlab.dev-franceconnect.fr/france-connect/fc

# Alias for the docker-stack command (you can add it to your "~/.bash_aliases" if you prefer but don't forget to set the variables before the .bash_aliases sourcing in your .bashrc 😉) :
alias dks=$FC_ROOT/fc/docker/docker-stack

# If you use version 2 of docker compose
export FC_DOCKER_COMPOSE='docker compose'
```

- Clone every needed repository

```bash
mkdir -p $FC_ROOT && cd $FC_ROOT

# The main repository
git clone ssh://git@gitlab.dev-franceconnect.fr:2222/france-connect/fc.git

# Backoffice apps
git clone ssh://git@gitlab.dev-franceconnect.fr:2222/france-connect/fc-apps.git
```

- Link the cloned repository in the docker volumes

```bash
cd $FC_ROOT/fc/docker/volumes/src
ln -s $FC_ROOT/fc
ln -s $FC_ROOT/fc-apps
```

- pull FC docker images, you will need to authenticate against the FC docker registry:

```bash
docker login $FC_DOCKER_REGISTRY
```

You will be prompted for:

- a username: use your gitlab.dev-franceconnect.fr username
- a password: as two-factor authentication is mandatory, you'll need to create an access token with only "read_registry" permission from your account settings: https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html. If you are not from the internal team, please ask an FC for one through support.

## Run the application

### Running AgentConnect

```bash
dks switch min-fca-low
```

On https://fsa1-low.docker.dev-franceconnect.fr/, you can test the connexion with :

- On the AgentConnect page use this email: `test@fia1.fr`
- Change the login to: `test`
- Leave the password empty

You are now connected to fsa1!

### Running FC exploitation for AgentConnect

```bash
dks switch bdd-fca-low
```

Then go to https://exploitation-fca-low.docker.dev-franceconnect.fr/login.

Login with:
- Username: `jean_moust`
- Password: `georgesmoustaki`
- TOTP: enter this secret in your totp app `KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD`

More credentials can be found here : `fc-apps/shared/fixtures/User.yml`.

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

### Halt a stack

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
cd $FC_ROOT/fc/back
yarn test --coverage --maxWorkers=50%
```

## Run the quality Tests

### Prerequisites

```bash
cd $FC_ROOT/fc/quality/fca
yarn install
```

### Run tests from the Cypress UI

```bash
yarn start:low
```

## Visualization Tests

```bash
cd $FC_ROOT/fc/quality/fca
yarn test:low:snapshot
```

## Run static tests

```bash
cd $FC_ROOT/fc/back
yarn doc
yarn lint --fix
yarn prettier --write
```
