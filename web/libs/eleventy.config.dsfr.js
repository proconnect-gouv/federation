const pluginBundle = require('@11ty/eleventy-plugin-bundle');
const pluginNavigation = require('@11ty/eleventy-navigation');
const pluginMermaid = require('@kevingimbel/eleventy-plugin-mermaid');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

const { EleventyHtmlBasePlugin } = require('@11ty/eleventy');

module.exports = function (eleventyConfig) {
  // Copy the contents of the `public` folder to the output folder
  // For example, `./public/css/` ends up in `_site/css/`
  eleventyConfig.addPassthroughCopy({
    './public/': '/',
    './node_modules/@gouvfr/dsfr/dist/favicon': '/favicon',
    './node_modules/@gouvfr/dsfr/dist/fonts': '/css/fonts',
    './node_modules/@gouvfr/dsfr/dist/icons': '/css/icons',
    './node_modules/@gouvfr/dsfr/dist/dsfr.min.css': '/css/dsfr.min.css',
    './node_modules/@gouvfr/dsfr/dist/utility/utility.min.css': '/css/dsfr/utility.min.css',
    './node_modules/@gouvfr/dsfr/dist/dsfr.module.min.js': '/js/dsfr.module.min.js',
    './node_modules/@gouvfr/dsfr/dist/dsfr.nomodule.min.js': '/js/dsfr.nomodule.min.js',
    './node_modules/@gouvfr/dsfr/dist/artwork': '/artwork',
    './node_modules/prismjs/themes/prism-okaidia.css': '/css/prism-okaidia.css',
  });

  // Watch content images for the image pipeline.
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets
  eleventyConfig.addWatchTarget('content/**/*.{svg,webp,png,jpeg}');

  // App plugins
  eleventyConfig.addPlugin(require('./eleventy.config.images.js'));
  eleventyConfig.addPlugin(require('./eleventy.config.filters.js'));
  eleventyConfig.addPlugin(require('./eleventy.config.markdown.js'));

  // Official plugins
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(pluginBundle);
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  eleventyConfig.addPlugin(pluginMermaid);

  // Automatically strip all leading or trailing whitespace
  // to prevent Markdown lib from rendering with wrapping into paragraphs
  // instead of using Nunjucks special syntax. Learn more:
  // https://mozilla.github.io/nunjucks/templating.html#whitespace-control
  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true,
    lstripBlocks: true,
  });
};
