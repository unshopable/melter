const FileHierarchyPlugin = require('./file-hierarchy-plugin.js');

/** @type {import("@unshopable/melter").MelterConfig} */
const melterConfig = {
  // Disable built-in PathsPlugin.
  paths: false,

  plugins: [new FileHierarchyPlugin()],
};

module.exports = melterConfig;
