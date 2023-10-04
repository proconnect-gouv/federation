# FC Statics Websites (11TY)

- [FC Statics Websites (11TY)](#fc-statics-websites-11ty)
  - [Documentations](#documentations)
  - [Project Structure](#project-structure)
  - [Start your application in dev mode](#start-your-application-in-dev-mode)
  - [Build your application for production](#build-your-application-for-production)
  - [HOWTO](#howto)
    - [Create a new application (minimal requirements)](#create-a-new-application-minimal-requirements)
    - [Create custom templates/components/layouts for an application (optional)](#create-custom-templatescomponentslayouts-for-an-application-optional)
    - [Add a custom plugin to your pages](#add-a-custom-plugin-to-your-pages)
    - [Add a page to the navigation bar](#add-a-page-to-the-navigation-bar)
    - [Use a specific layout for a page](#use-a-specific-layout-for-a-page)
    - [Define a page title/description](#define-a-page-titledescription)
  - [Start your application into dev mode](#start-your-application-into-dev-mode)
  - [Build your application for production](#build-your-application-for-production-1)
  - [Issues \& Fixes](#issues--fixes)

### Documentations

- [Eleventy 11Ty](https://www.11ty.dev/docs/)
- [Composants DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/)
- [Eleventy DSFR](https://github.com/codegouvfr/eleventy-dsfr)
- [Acessibilite Numerique](https://github.com/DISIC/accessibilite.numerique.gouv.fr/blob/main/CONTRIBUTING.md)

### Project Structure

- Main applications markdown files : `$FC_ROOT/web/apps`
- Output applications folder : `$FC_ROOT/web/instances`
- Generics shareds files/folder across applications : `$FC_ROOT/web/libs`

### Start your application in dev mode

```bash
cd $FC_ROOT/fc/web
yarn start [app_name]
```

### Build your application for production

```bash
cd $FC_ROOT/fc/web
yarn build [app_name]
```

## HOWTO

### Create a new application (minimal requirements)

- Into `./apps` folder, duplicate `./apps/example` folder and rename it to `./apps/[app_name]`
- Into `./apps/[app_name]/package.json` update the `name` and `description` fields with your project `app_name`
- Into `./web/package.json`, into the `scripts` section, create these entries
  ```json
  "scripts": {
    "start:[app_name]": "./scripts/yarn-watch.sh [app_name]",
    "build:[app_name]": "./scripts/yarn-build.sh [app_name]",
  }
  ```

Into the `./apps/[app_name]` folder

- `content` folder is used to store markdown contents files
- `public/css/styles.css` will be used to write custom app CSS styles
- `_data/metadata.json` will be used to brand your website

### Create custom templates/components/layouts for an application (optional)

Into the `./apps/[app_name]/_includes` folder

- To store **specifics components** used into templates (checkboxes, modals...), create a `components` folder
- To store **specifics pages partials** used into layouts (head, footer...), create a `./_includes/templates` folder
- To store **specifics templates pages** used by contents files (home, contact...), Create a `./_includes/layouts` folder

### Add a custom plugin to your pages

- Add your plugin as a dependency into `./app/[app_name]/package.json`
- Duplicate `./libs/eleventy.config.js` into `./app/[app_name]`
- Import your plugin into `./app/[app_name]/eleventy.config.js`

**Example :**

```javascript
const mermaidPlugin = require('@kevingimbel/eleventy-plugin-mermaid');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(require('./eleventy.config.dsfr.js'));
  eleventyConfig.addPlugin(mermaidPlugin);
  [...]
}
```

### Add a page to the navigation bar

Into the `./apps/[app_name]/content/[my_page].md`, use the template header to define your needs

```nunjucks
---
eleventyNavigation:
  order: 1
  key: accueil
---
```

### Use a specific layout for a page

Into the `./apps/[app_name]/content/[my_page].md`, use the template header to define your needs

```nunjucks
---
layout: layouts/my-custom-layout.njk
---
```

### Define a page title/description

Into the `./apps/[app_name]/content/[my_page].md`, use the template header to define your needs

```nunjucks
---
title: My Website Homepage
description: Lorem ipsum dolor sit amet...
---
```

## Start your application into dev mode

```bash
cd $FC_ROOT/fc/web
yarn start:[app_name]
```

## Build your application for production

```bash
cd $FC_ROOT/fc/web
yarn build:[app_name]
```

## Issues & Fixes

- [ ] While watching in dev mode and deleting file/folder
- [ ] Need to re `start-all` to take `./libs` folder changes
- [x] Sticky Footer is not yet implemented
- [x] No Docker container
- [ ] SASS files are not yet managed
