// DISCLAIMER
// This plugin only handles the happy path and is not ready for production.

const path = require('path');
const { Plugin } = require('@unshopable/melter');

const templatesMap = {
  cart: 'cart',
  password: 'password',
  'products-[handle]': 'product',
};

class FileHierarchyPlugin extends Plugin {
  apply(compiler) {
    compiler.hooks.emitter.tap('FileHierarchyPlugin', (emitter) => {
      emitter.hooks.beforeAssetAction.tap('FileHierarchyPlugin', (asset) => {
        const targetPath = this.getTargetPath(asset.source.relative);
        const assetTargetPath = this.resolveAssetTargetPath(
          compiler.cwd,
          compiler.config.output,
          targetPath,
        );

        asset.target = assetTargetPath;
      });
    });
  }

  getTargetPath(sourcePath) {
    const sourcePathParts = sourcePath.split('/');

    switch (sourcePathParts[1]) {
      case 'storefront': {
        return this.getTargetPathForStorefrontPath(sourcePathParts.slice(1));
      }
    }
  }

  getTargetPathForStorefrontPath(pathParts) {
    switch (pathParts.at(-1)) {
      case 'layout.liquid': {
        const match = pathParts.at(-2).match(/\((.+)\)/);

        return `layout/${match[1]}.liquid`;
      }

      case 'template.json': {
        const templatePathParts = pathParts.slice(2, -1);
        const templateKey = templatePathParts.join('-');

        return `templates/${templatesMap[templateKey]}.json`;
      }
    }
  }

  resolveAssetTargetPath(cwd, output, targetPath) {
    const relativeAssetTargetPath = path.resolve(output, targetPath);
    const absoluteAssetTargetPath = path.resolve(cwd, relativeAssetTargetPath);

    return {
      absolute: absoluteAssetTargetPath,
      relative: relativeAssetTargetPath,
    };
  }
}

module.exports = FileHierarchyPlugin;
