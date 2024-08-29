DKS_PATH := ../../../docker/docker-stack

# access to the mongo shell
mongo db:
	$(DKS_PATH) mongo-shell-core-fca-low

# delete all previous data in mongo and launch fixtures
reset-db:
	$(DKS_PATH) reset-db-core-fca-low

# start the default fca stack
start s:
	$(DKS_PATH) prune && $(DKS_PATH) up bdd-fca-low && $(DKS_PATH) start-all

# start the default fca stack without pulling docker images
start-offline so:
	$(DKS_PATH) prune && OFFLINE=1 $(DKS_PATH) up bdd-fca-low && $(DKS_PATH) start-all

# start a min fca low stack
start-min sm:
	$(DKS_PATH) prune && $(DKS_PATH) up min-fca-low && $(DKS_PATH) start-all

# start a min fca low stack without pulling docker images
start-min-offline smo:
	$(DKS_PATH) prune && OFFLINE=1 && $(DKS_PATH) up min-fca-low && $(DKS_PATH) start-all

# start a default fca stack without idp by default
start-rie rie:
	$(DKS_PATH) prune && $(DKS_PATH) up min-fca-rie && $(DKS_PATH) start-all

restart r:
	$(DKS_PATH) start-all

## stop all containers
halt:
	$(DKS_PATH) halt

stop: halt

# display logs for default fca stack
log l:
	$(DKS_PATH) log core-fca-low

# display logs for rie fca stack
log-rie lrie:
	$(DKS_PATH) log core-fca-rie

# start a shell in the default fca stack container
bash b:
	$(DKS_PATH) exec core-fca-low bash

# clean the code of /back by launching prettier and eslint
prepare p:
	$(DKS_PATH) exec core-fca-low yarn lint --fix && $(DKS_PATH) exec core-fca-low yarn prettier --write

# clean the code of /back and /quality/fca by launching prettier and eslint
prepare-full pf:
	$(DKS_PATH) exec core-fca-low yarn lint --fix &&\
	$(DKS_PATH) exec core-fca-low yarn prettier --write &&\
	cd $(FC_ROOT)/fc/quality/fca && yarn lint --fix && yarn prettier --write

# update the doc
doc:
	$(DKS_PATH) exec core-fca-low yarn doc

# launch the unit tests with the coverage
test-coverage tc:
	$(DKS_PATH) exec core-fca-low yarn test --coverage	

# launch the unit tests
test t:
	$(DKS_PATH) exec core-fca-low yarn test	

# launch the cypress tests with the graphic user interface
quality tq:
	cd $(FC_ROOT)/fc/quality/fca && yarn install && yarn start:low

# launch the cypress tests in headless mode
quality-hide tqh:
	cd $(FC_ROOT)/fc/quality/fca && yarn install && yarn test:low

# launch the cypress tests on the integration environment
quality-integration tqi:
	cd $(FC_ROOT)/fc/quality/fca && yarn install && CYPRESS_TEST_ENV=integ01 yarn start:low

# launch the cypress visual tests
visual v:
	cd $(FC_ROOT)/fc/quality/fca && yarn install && yarn test:low:snapshot

# update the snapshot of the visual tests
update-visual:
	cd $(FC_ROOT)/fc/quality/fca && yarn install && yarn test:low:snapshot --env updateSnapshots=true

## FC Exploitation

# start the exploitation stack
start-exploitation se:
	$(DKS_PATH) start exploitation-fca-low

# display log of the exploitation container
log-exploitation le:
	$(DKS_PATH) log exploitation-fca-low

# launch the tests for exploitation
test-exploitation te:
	$(DKS_PATH) exec exploitation-fca-low yarn test	
