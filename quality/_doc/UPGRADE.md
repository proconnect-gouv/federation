# Framework Upgrade

## Cypress Upgrade

### Resources

#### Cypress Core

- [Cypress Migration Guide](https://docs.cypress.io/guides/references/migration-guide)
- [Cypress changelog](https://docs.cypress.io/guides/references/changelog)
- [Cypress issues](https://github.com/cypress-io/cypress/issues)

- [Cypress Cucumber Preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor/releases)

#### Cypress Plugins

- [cypress-axe](https://yarnpkg.com/package?q=cypress-axe&name=cypress-axe)
- [cypress-image-snapshot](https://yarnpkg.com/package?q=cypress-image-snapshot&name=@simonsmith/cypress-image-snapshot)
- [cypress-maildev](https://yarnpkg.com/package?q=cypress-maildev&name=cypress-maildev)
- [cypress-on-fix](https://yarnpkg.com/package?q=cypress-on-fix&name=cypress-on-fix)
- [cypress-plugin-api](https://yarnpkg.com/package?q=cypress-plugin-api&name=cypress-plugin-api)

#### Autres

- [axe-core (accessibility)](https://github.com/dequelabs/axe-core/releases)
- [multiple-cucumber-html-reporter (reporting)](https://yarnpkg.com/package?q=multiple-cucumber-html-reporter&name=multiple-cucumber-html-reporter)
- [amqplib (RabbitMQ client)](https://yarnpkg.com/package?q=amqplib&name=amqplib)
- [mongodb (MongoDB client)](https://yarnpkg.com/package?q=%20%20%20%20mongodb&name=mongodb)
- [postgres (Postgres client)](https://yarnpkg.com/package?q=postgres&name=postgres)

### Upgrade Process

1. Read the Cypress Migration and changelog to detect interesting release to upgrade to
2. Check the opened issues on the release (the latest release could be unstable)
3. Check the compatibility with the Cypress Cucumber Preprocessor
4. Upgrade Cypress with the Cypress Cucumber Preprocessor
5. Check the impact on a test execution
6. Adjust the Cypress tests
7. Adjust the Cypress plugins
8. Run the tests BDD on FC+ and E2E on FC-APPS to check the stability of the run
9. Run the tests BDD on FC+, FC v2, user-dashboard, FC legacy, formulaire-usagers
10. Run the tests E2E on FC-APPS

### Known issues when upgrading to Cypress v14.0.3

#### 1. `cypress-maildev`

The `v1.3.2` changed the navigation to the mail content. `maildevVisitMessageById` uses a `cy.origin` call which prevents its usage on our local stack.

see https://github.com/Clebiez/cypress-maildev/pull/12/files

#### 2. `@badeball/cypress-cucumber-preprocessor`

The `v22.0.1` doesn't work with our tests, as we get the error:

`Reflect.getMetadata is not a function`

It is due to the missing dependencie "reflect-metadata". It has been removed after this fix:
https://github.com/badeball/cypress-cucumber-preprocessor/issues/1273

During the next Cypress upgrade, we can reassess whether it gets corrected or whether we should include the missing dependencies ourselves.

#### 3. `multiple-cucumber-html-reporter`

The `v3.9.0` and `v3.9.1` have issues with the bootstrap dependency and the rendering.

`Uncaught TypeError: i.createPopper is not a function`

We keep the version `v3.8.0` for the time being.
