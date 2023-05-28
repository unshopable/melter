const { Plugin } = require('@unshopable/melter');

class HelloToHiPlugin extends Plugin {
  apply(compiler) {
    compiler.hooks.emitter.tap('HelloToHiPlugin', (emitter) => {
      emitter.hooks.beforeAssetAction.tap('HelloToHiPlugin', (asset) => {
        const assetContentString = asset.content.toString();

        if (assetContentString.includes('Hello')) {
          const updatedContent = assetContentString.replace('Hello', 'Hi');

          asset.content = Buffer.from(updatedContent);
        }
      });
    });
  }
}

module.exports = HelloToHiPlugin;
