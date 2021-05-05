# poc-cypress-cucumber

POC of Test Framework using Cypress/Cucumber

## Documentation

- [BDD Framework documentation on the Wiki](https://gitlab.dev-franceconnect.fr/france-connect/documentation/-/wikis/Produits/Tests/Framework-BDD/Introduction)

## Scripts

### Run the Cypress test in the terminal (deleting previous results)

```
# Run Cypress against dev environment
yarn test

# Run Cypress against integ01 environment
CYPRESS_TEST_ENV=integ01 yarn test
```

### Open Cypress window

```
# Run Cypress against dev environment
yarn start

# Run Cypress against integ01 environment
CYPRESS_TEST_ENV=integ01 yarn start
```

### Generate/Open the Cucumber HTML report

```
yarn report
```

## Folder Structure

- Features folder: [/cypress/integration](./cypress/integration)
- Steps folder: [/cypress/support/steps](./cypress/support/steps)
- Test Data folder: [/cypress/fixtures](./cypress/fixtures)

## Plugins VSCode

### Cucumber (Gherkin) Full Support

https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete

Ce plugin aide à la rédaction des scénarios dans les feature files.
Le plugin automatiquement liste les steps implémentés lors de la rédaction des scénarios.

```
{
  "cSpell.language": "en,fr",
  "cSpell.enableFiletypes": [
    "feature"
  ],
  "cucumberautocomplete.customParameters": [
  ],
  "cucumberautocomplete.steps": [
    "cypress/support/**/steps/*.ts"
  ],
  "cucumberautocomplete.strictGherkinCompletion": false,
  "cSpell.userWords": [
    "Etant"
  ]
}
```

## Sources

- [Install Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress)
- [TypeScript support for Cypress](https://docs.cypress.io/guides/tooling/typescript-support#Set-up-your-dev-environment)
- [Cypress Cucumber preprocessor](https://www.npmjs.com/package/cypress-cucumber-preprocessor#typeScript-support)
- [Cucumber HTML reporter](https://www.npmjs.com/package/cucumber-html-reporter)
- [Framework Example](https://www.toolsqa.com/cypress/bdd-automation-framework-in-cypress/)
- [BDD scénario en français](https://www.zenvalue.fr/post/l-utilisation-du-bdd-dans-la-discussion-autour-des-user-stories)
