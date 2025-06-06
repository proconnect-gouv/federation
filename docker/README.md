# The local "docker stack" DEV stack

## Description

This directory contains everything to run a local ProConnect stack. This local environment is as close as possible to the other distant ones (proxy, rp ...). Be careful not to launch too many containers as it could take too much resources (we are working on that).

## Content

- The core applications (core-\*) which are the main application of ProConnect.
- The back office applications (admin-\*) used to manage the project.
- The identities providers mocks (fia-\*).
- The services providers mocks (fsa-\* for AC).
- All software needed alongside those apps to make the stack work (MongoDB, Redis, NginX, Squid, ...).

## Some advanced usage

### Access a MongoDb shell

```bash
dks mongo-shell-core-fca-low
```

### Reset the MongoDb fixtures

```bash
dks reset-db-core-fca-low
```

### Execute a shell command in a container

```bash
dks exec <container_name> <command>
```

### Troubleshooting

You may experience some docker network issues with docker containers, for example in case of a switch of network on the hosts or long inactivity of the stack.

In most case you can get back a healthy state by resetting the stack with `dks prune`

### Maintaining and Extending

See [dedicated README](../bash/README.md) alongside the source code of docker-stack.

## Architecture

### docker-stack script

The docker-stack script can be used to ease the manipulation of the local DEV stack. It is also used by the CI.

See [docker-stack.md](_doc/docker-stack.md).

### Directory : compose

This directory contains all compose files with their environement files. The content is organized with the following pattern:

```
compose/
  shared/ -> contains compose files for shared bricks (proxys, ...)
    .env/
      base-env.env -> Contains ENV vars shared between all NodeJS apps
  stack-name/
    .env/
      service-1.env
      service-2.env
    service-1.yml
    service-2.yml
    stack.yml -> Contains the definition of groups containers for this stack (min-core-fcp-high, all-core-fcp-high for exemple)
```

### Directory: volumes

The directory contains volumes that will be mounted inside the docker containers.

```
volumes/
  shared/
    shared-service/
      ...
  stack-name
    service-1/
      ...
    service-2/
      ...
```

⚠️ Some volumes are symbolic links to source code from in /back folder.

## How To

### Add a new application to the stack

#### Requirements

- create a named application folder into `compose` folder (see [description](#directory--compose))
- create the `<my_application>/.env` folder

- create the `<my_application>/stack.yml` file

```yml
services:
  <my_application>:
    image: alpine
    depends_on:
      - '<my_application>-<back>'

  bdd-<my_application>:
    image: alpine
    depends_on:
      # -- MY APPLICATION
      - '<my_application>'
```

- create the application availables services `<my_application>/<my_application>.yml` file

```yml
services:
  <my_application>-<back>:
    hostname: <my_application>-<back>
    image: ${PC_DOCKER_REGISTRY}/nodejs:${NODE_VERSION}-dev
    user: ${CURRENT_UID}
    working_dir: /var/www/app
    depends_on:
      - <...any_required_service...>
    volumes:
      - '${VOLUMES_DIR}/src/fc/back:/var/www/app'
      - '${VOLUMES_DIR}/app:/opt/scripts'
      - '${VOLUMES_DIR}/.home:/home'
      - <...others_required_volumes...>
    env_file:
      - '${COMPOSE_DIR}/shared/.env/base-app.env'
    networks:
      - public
    init: true
    command: 'pm2 logs'
```
