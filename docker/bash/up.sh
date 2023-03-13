#!/usr/bin/env bash

_up() {
  apps=${@:-none}
  services=rp-all
  for app in $apps
  do
    case "$app" in
      rp-all)
        services="rp-all"
        ;;
      all-eidas-high)
        services="$services all-eidas-high"
      ;;
      min-eidas-high)
        services="$services min-eidas-high"
      ;;
      lemon-ldap)
        services="$services lemon-ldap"
        ;;
      hybridge-fca-low)
        services="$services hybridge-fca-low"
        ;;
      all-fca-low)
        services="$services all-fca-low"
        ;;
      bdd-fca-low)
        services="$services bdd-fca-low"
        ;;
      min-fca-low)
        services="$services min-fca-low"
        ;;
      exploit-fca-low)
        services="$services exploit-fca-low"
        ;;
      rnipp)
        services="$services rnipp"
        ;;
      all-fcp-high)
        services="$services all-fcp-high"
        ;;
      bdd-fcp-high)
        services="$services bdd-fcp-high"
        ;;
      min-fcp-high)
        services="$services min-fcp-high"
        ;;
      exploit-fcp-high)
        services="$services exploit-fcp-high"
        ;;
      bridge-proxy-rie)
        services="$services bridge-proxy-rie"
        ;;
      eidas-bridge)
        services="$services eidas-bridge"
        ;;
      eidas-fr)
        services="$services eidas-fr"
        ;;
      eidas-mock)
        services="$services eidas-mock"
        ;;
      eidas-be)
        services="$services eidas-be"
        ;;
      exploitation-fca-low)
        services="$services exploitation-fca-low"
        ;;
      exploit-fcp-high-front)
        services="$services exploit-fcp-high-front"
        ;;
      exploit-fcp-high-back)
        services="$services exploit-fcp-high-back"
        ;;
      exploitation-high)
        services="$services exploitation-high"
        ;;
      exploit-fca-low-front)
        services="$services exploit-fca-low-front"
        ;;
      exploit-fca-low-back)
        services="$services exploit-fca-low-back"
        ;;
      all-fcp-low)
        services="$services all-fcp-low"
        ;;
      bdd-fcp-low)
        services="$services bdd-fcp-low"
        ;;
      min-fcp-low)
        services="$services min-fcp-low"
        ;;
      mongo-fcp-high)
        # Needed for user dashboard, do not start rp-all
        services="mongo-fcp-high"
        ;;
      partners-fca)
        services="$services partners-fca"
        ;;
      partners-fcp)
        services="$services partners-fcp"
        ;;
      min-storybook)
        services="$services min-storybook"
        ;;
      usagers-fca)
        services="$services usagers-fca"
        ;;
      mock-rnipp)
        services="$services mock-rnipp"
        ;;
      min-core-legacy)
        services="$services min-core-legacy"
        ;;
      ud)
        services="$services ud"
        ;;
      all)
        services=all
        break
        ;;
      *)
        echo "Usage: $script <option>:"
        echo "----"
        echo "* up => Select the apps you want to up as well as their dependencies (multiple arguments allowed) :"
        echo "  - min-eidas-high => up minimal needed services to run eidas (min-fcp-high + eidas + 2 mocks)"
        echo "  - all-eidas-high => all needed services to run eidas (all-fcp-high + eidas + 2 mocks)"
        echo "  - min-fcp-high => up minimal needed services to run fcp-high (core-fcp-high, fsp1-high, fip1-high, etc.)"
        echo "  - bdd-fcp-high => up needed services to run the bdd tests on fcp-high"
        echo "  - all-fcp-high => all needed services to run fcp-high (core-fcp-high, fsp1-high, fsp2-high, fsp3-high, fsp5-high, fsp6-high, fip1-high, fip2-high, fip6-high, rnipp, haproxy, hsm, etc.)"
        echo "  - exploit-fcp-high => up minimal needed services to run the FranceConnect High fc-apps"
        echo "  - min-fcp-low => up minimal needed services to run core-fcp-low fsp1-low fip1-low"
        echo "  - bdd-fcp-low => up needed services to run the bdd tests on fcp-low"
        echo "  - all-fcp-low => up all needed services to run core-fcp-low and all other future services"
        echo "  - min-fca-low => up minimal needed services to run core-fca-low fsa1-low fia1-low"
        echo "  - bdd-fca-low => up needed services to run the bdd tests on fca-low"
        echo "  - all-fca-low => all needed services to run fca-low stack (core-fca-low, fsa[n]-low, fia[n]-low, exploit, hsm, etc.)"
        echo "  - exploit-fca-low => up minimal needed services to run the Agentconnect Low fc-apps"
        echo "  - lemon-ldap => up needed services to run lemon-ldap and to access his manager"
        echo "  - hybridge-fca-low => up minimal needed services to run core-fca-low fca-low-front bridge-proxy-rie fsa1-low lemon-ldap"
        echo "  - partners-fca => up minimal needed services to run partners fca front and back"
        echo "  - partners-fcp => up minimal needed services to run partners fcp front and back"
        echo "  - usagers-fca => up minimal needed services to run usager agentConnect"
        echo "  - mock-rnipp => up minimal needed services to run mock-rnipp"
        echo "  - min-storybook => up minimal needed services to run storybook"
        echo "  - min-core-legacy => up minimal needed services to run core legacy"
        echo "  - ud => up User Dashboard"
        echo "  - all => run all services"
        echo "----"
        exit 1
        ;;
    esac
  done
    echo "Starting FC Dev environment... $@"
    docker login ${FC_DOCKER_REGISTRY}
    docker pull registry.gitlab.dev-franceconnect.fr/france-connect/fc-docker/nodejs:${DEFAULT_NODE_VERSION}-dev
    cd ${WORKING_DIR} && docker-compose up --build -d $services

    _get_running_containers
    if [ "${_ONLY_NODEJS_NON_LEGACY_RUNNING_CONTAINERS:-xxx}" != "xxx" ]
    then
      echo "Installing node modules..."
      _install_dependencies $_ONLY_NODEJS_NON_LEGACY_RUNNING_CONTAINERS
    fi

    case $services in
      *"lemon-ldap"*)
        # Sleep to wait for configuration initialization
        echo "Restore LemonLDAP configuration"
        cd ${WORKING_DIR} && docker-compose exec fia-llng-low bash /scripts/init.sh
        echo "Loaded !"
        ;;
      *"hybridge-"*)
        # Sleep to wait for configuration initialization
        echo "Restore LemonLDAP configuration"
        sleep 10
        cd ${WORKING_DIR} && docker-compose exec fia-llng-low bash /scripts/init.sh
        # Sleep to wait for mongodb replicat initialization
        echo "Reseting database to default state..."
        sleep 10
        docker-compose exec $NO_TTY mongo-fca-low /opt/scripts/manage.sh --reset-db
        echo "Loaded !"
        ;;
      *"-fcp-low"*)
        # Sleep to wait for mongodb replicat initialization
        echo "Reseting database to default state..."
        echo $services
        sleep 10
        docker-compose exec $NO_TTY mongo-fcp-low /opt/scripts/manage.sh --reset-db
        echo "Loaded !"
        ;;
      *"-core-legacy"* | *"ud"* | *"stack-ud"* | *"bdd-ud"* | *"all-v1"* | *"stack-fd-tracks"*)
        # Sleep to wait for mongodb replicat initialization
        echo "Reseting database legacy to default state..."
        echo $services
        sleep 10
        docker-compose exec $NO_TTY mongo-legacy /opt/scripts/manage.sh --reset-db
        echo "Loaded !"
        ;;
      *"-fcp-high"*)
        # Sleep to wait for mongodb replicat initialization
        echo "Reseting database to default state..."
        sleep 10
        docker-compose exec $NO_TTY mongo-fcp-high /opt/scripts/manage.sh --reset-db
        echo "Loaded !"
        ;;
      *"-fca-low"*)
        # Sleep to wait for mongodb replicat initialization
        echo "Reseting database to default state..."
        sleep 10
        docker-compose exec $NO_TTY mongo-fca-low /opt/scripts/manage.sh --reset-db
        echo "Loaded !"
        ;;
      *"-eidas"*)
        # Sleep to wait for mongodb replicat initialization
        echo "Reseting database to default state..."
        echo $services
        sleep 10
        docker-compose exec $NO_TTY mongo-fcp-high /opt/scripts/manage.sh --reset-db
        echo "Loaded !"
        ;;
      *"partners-fca"*)
        echo "Running migrations on database..."
        _migrations-partners "partners-fca-back"
        echo "Inserting fixtures in database..."
        _fixtures-partners "partners-fca-back"
        ;;
      *"partners-fcp"*)
        echo "Running migrations on database..."
        _migrations-partners "partners-fcp-back"
        echo "Inserting fixtures in database..."
        _fixtures-partners "partners-fcp-back"
        ;;
      *"ud"* | *"stack-ud"* | *"bdd-ud"* | *"all-v1"* | *"stack-fd-tracks"*)
        # Waiting for ES to be up
        sleep 15
        echo "Initialize user-dashboard data..."
        _init_ud
        ;;
    esac
}

