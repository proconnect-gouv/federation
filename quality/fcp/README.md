# fcp-system-testing

FCP validation with system tests implemented using a Test Framework (based on Cypress/Cucumber)

## Documentation

- [BDD Framework documentation on the Wiki](https://gitlab.dev-franceconnect.fr/france-connect/documentation/-/wikis/Produits/Tests/Framework-BDD/Introduction)

## Folder Structure

- Features folder: [/cypress/integration](./cypress/integration)
- Steps/Pages folder (exploitation): [/cypress/support/exploitation](./cypress/support/exploitation)
- Steps/Pages folder (usager): [/cypress/support/usager](./cypress/support/usager)
- Test Data folder: [/cypress/fixtures](./cypress/fixtures)

## Environment Variables

| Environment Variable | Description                       | Comment                                      |
| -------------------- | --------------------------------- | -------------------------------------------- |
| PLATFORM             | Platform under test               | `fcp-high` or `fcp-low`                      |
| TEST_ENV             | Test environment                  | `docker` or `recette`, etc.                  |
| TAGS                 | Tags expression                   | `not @ignoreLow and not @fcpHigh`            |
| EXPLOIT_ADMIN_NAME   | Exploitation admin username       | needed only for integ01/preprod              |
| EXPLOIT_ADMIN_PASS   | Exploitation admin password       | needed only for integ01/preprod              |
| EXPLOIT_ADMIN_TOTP   | Exploitation admin totp secret    | needed only for integ01/preprod              |
| EXPLOIT_USER_NAME    | Exploitation operator username    | needed only for integ01/preprod              |
| EXPLOIT_USER_PASS    | Exploitation operator password    | needed only for integ01/preprod              |
| EXPLOIT_USER_TOTP    | Exploitation operator totp secret | needed only for integ01/preprod              |
| FC_ACCESS_USER       | FranceConnect network username    | needed on recette/integ01 outside FC network |
| FC_ACCESS_PASS       | FranceConnect network password    | needed on recette/integ01 outside FC network |

## Scripts

### Run the Cypress test in the terminal (deleting previous results)

```
# Run Cypress on fcpLow against docker environment
yarn test:low

# Run Cypress on fcpHigh against integ01 environment
CYPRESS_TEST_ENV=integ01 yarn test:high
```

### Open Cypress window

```
# Run Cypress on fcpHigh against docker environment
yarn start:high

# Run Cypress on fcpLow against integ01 environment
CYPRESS_TEST_ENV=integ01 yarn start:low
```

### Generate the Cucumber HTML report

```
# Add Screenshots/Videos to the Cucumber logs
yarn report:prepare

# Generate the report
CYPRESS_PLATFORM=fcp-high CYPRESS_TEST_ENV=recette CI_MERGE_REQUEST_SOURCE_BRANCH_NAME=FC-513 CI_JOB_ID=123456789 PLATFORM_VERSION=1.2.3 yarn report:generate
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
