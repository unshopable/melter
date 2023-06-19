const { LiquidXPlugin } = require('@unshopable/melter-plugin-liquidx');

/** @type {import("@unshopable/melter").MelterConfig} */
const melterConfig = {
  paths: {
    snippets: [/components\/.*\.liquid$/, /snippets\/[^\/]*\.liquid$/],
  },

  plugins: [new LiquidXPlugin()],
};

module.exports = melterConfig;
