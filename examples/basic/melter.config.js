const HelloToHiPlugin = require('./hello-to-hi-plugin.js');

/** @type {import("@unshopable/melter").MelterConfig} */
const melterConfig = {
  paths: {
    sections: [/sections\/[^\/]*\.liquid$/, /sections\/legacy\/[^\/]*\.liquid$/],
    snippets: [/components\/[^\/]*\.liquid$/, /snippets\/[^\/]*\.liquid$/],
  },

  plugins: [new HelloToHiPlugin()],
};

module.exports = melterConfig;
