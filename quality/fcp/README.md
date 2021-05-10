# fcp-system-testing

FCP validation with system tests implemented using a Test Framework (based on Cypress/Cucumber)

## Documentation

- [BDD Framework documentation on the Wiki](https://gitlab.dev-franceconnect.fr/france-connect/documentation/-/wikis/Produits/Tests/Framework-BDD/Introduction)

## Folder Structure

- Features folder: [/cypress/integration](./cypress/integration)
- Steps/Pages folder (usager): [/cypress/support/usager](./cypress/support/usager)
- Test Data folder: [/cypress/fixtures](./cypress/fixtures)

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

## Plugins VSCode

### Cucumber (Gherkin) Full Support

https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete

This plugin provides support for writing/maintaining scenarios in the feature files.
It automatically lists the implemented steps while editing the scenarios.

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
