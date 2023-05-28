# melter

Melter is used to compile files into something that is compatible with [Shopify's theme architecture](https://shopify.dev/docs/themes/architecture). You can interact with melter either from its API or CLI.

> **Warning**
> Melter is still in alpha. Expect breaking changes with every release. Please report any issues [here](https://github.com/unshopable/melter/issues).

## Table of Contents

- [Getting started](#getting-started)
- [Configuration](#configuration)
  - [Options](#options)
    - [Input](#input)
    - [Output](#output)
    - [Stats](#stats)
    - [Paths](#paths)
  - [Examples](#config-examples)
- [Plugins](#plugins)
  - [Examples](#plugin-examples)
  - [Official Plugins](#official-plugins)
  - [Community Plugins](#community-plugins)
  - [Custom Plugins](#custom-plugins)
- [Contributing](#contributing)
- [License](#license)

## Getting started

First, let's create a new directory, initialize npm, install melter and its CLI locally:

```sh
mkdir melter-basic-demo
cd melter-basic-demo
npm init -y
npm install --save-dev @unshopable/melter @unshopable/melter-cli
```

Now we'll create the following directory structure, files and their contents:

```diff
  melter-basic-demo
  ├── node_modules
+ ├── src
+ │   └── sections
+ │       └── my-section.liquid
  ├── package-lock.json
  └── package.json
```

**src/my-section.liquid**

```html
<div>Hello, World!</div>
```

> Throughout the documenation we will use `diff` blocks to show you what changes we're making to directories, files, and code. For instance:

```diff
+ this is something new
- and this is something we removed
  and this is unchanged
```

Note that is is only a basic example to get you started with melter. Your directory structure will look quite different in production.

Next run:

```sh
$ npx melter

...

Compiled with 1 warnings

  ⚠ No config found. Loaded default config. To disable this warning create a custom config.
```

This should have created a new directory (`dist`) in the root of your project with the following directory strcuture, files and their contents:

```diff
  melter-basic-demo
+ ├── dist
+ │   └── sections
+ │       └── my-section.liquid
...
```

**dist/my-section.liquid**

```html
<div>Hello, World!</div>
```

Sure, that's not really exciting but we'll get there. Continue reading this documentation.

## Configuration

Since melter doesn't really do anything – or at least nothing useful – without configuration, let's create a config:

```diff
  melter-basic-demo
  ├── node_modules
  ├── src
  │   └── sections
  │       └── my-section.liquid
+ ├── melter.config.js
  ├── package-lock.json
  └── package.json
```

**melter.config.js**

```js
/** @type {import("@unshopable/melter").MelterConfig} */
const melterConfig = {};

module.exports = melterConfig;
```

### Options

#### Input

With the `input` option you can specify where melter should look for files to compile. Defaults to `src`.

#### Output

With the `output` option you can specify where melter should write the compiled files to. Defaults to `dist`.

If `output` is `undefined` no files will be emitted. You can still access them through [compilations stats]().

#### Stats

The `stats` option controls the built-in `StatsPlugin` which basically is just a simple logger. Defaults to `true`.

Setting it to `false` equals "silent" mode.

#### Paths

The `paths` options controls the built-in `PathsPlugin` which determines where to write files to within the `output` directory. It's based on Shopify's default theme architecture.

Setting it to `false` prevents the `PathsPlugin` from being applied which results in no files being emitted. This is handy if you want to implement a custom directory structure through plugins.

### Config Examples

Now that you know what can be configured, let's play with it:

**melter.config.js**

```diff
  /** @type {import("@unshopable/melter").MelterConfig} */
- const melterConfig = {};
+ const melterConfig = {
+   paths: {
+     sections: [
+       /sections\/[^\/]*\.liquid$/,
+       /sections\/legacy\/[^\/]*\.liquid$/,
+     ],
+   },
+ };

  module.exports = melterConfig;
```

Also update your `src` directory:

```diff
  melter-basic-demo
  ├── node_modules
  ├── src
  │   └── sections
+ │       ├── legacy
+ │       │   └── my-legacy-section.liquid
  │       └── my-section.liquid
  ├── melter.config.js
  ├── package-lock.json
  └── package.json
```

And once again, run:

```sh
$ npx melter

...

Successfully compiled in x ms
```

Your `dist` directory should look like this now:

```diff
  melter-basic-demo
  ├── dist
  │   └── sections
+ │       ├── my-legacy-section.liquid
  │       └── my-section.liquid
...
```

> **Warning**
> The `PathsPlugin` currently does not take care of multiple sections with the same name.

Now extend the `paths` option so we can split re-usable liquid components and UI components:

```diff
  /** @type {import("@unshopable/melter").MelterConfig} */
  const melterConfig = {
    paths: {
      sections: [
        /sections\/[^\/]*\.liquid$/,
        /sections\/legacy\/[^\/]*\.liquid$/,
      ],
+     snippets: [
+       /components\/[^\/]*\.liquid$/,
+       /snippets\/[^\/]*\.liquid$/,
+     ],
    },
  };

  module.exports = melterConfig;
```

And update your `src` directory:

```diff
  melter-basic-demo
  ├── node_modules
  ├── src
+ │   ├── components
+ │   │   └── my-ui-snippet.liquid
  │   ├── sections
  │   │   ├── legacy
  │   │   │   └── my-legacy-section.liquid
  │   │   └── my-section.liquid
+ │   └── snippets
+ │       └── my-functional-snippet.liquid
  ├── melter.config.js
  ├── package-lock.json
  └── package.json
```

Finally, run:

```sh
$ npx melter

...

Successfully compiled in x ms
```

Your `dist` directory should look like this now:

```diff
  melter-basic-demo
  ├── dist
  │   ├── sections
  │   │   ├── my-legacy-section.liquid
  │   │   └── my-section.liquid
+ │   └── snippets
+ │       ├── my-functional-snippet.liquid
+ │       └── my-ui-snippet.liquid
...
```

If you have custom requirements the base melter config might not be sufficient. In this case consider using an [official](#official-plugins) or [community](#community-plugins) plugin. You can also develop [custom plugins](#develop-plugins).

## Plugins

Plugins are what makes melter powerful. A plugin is a JavaScript object that has an `apply` method which is called by the melter compiler, giving it access to the entire compilation lifecycle.

### Plugin Examples

To see them in action, create a new file in your root directory:

```diff
  melter-basic-demo
  ├── node_modules
  ├── src
  │   └── sections
  │       ├── legacy
  │       │   └── my-legacy-section.liquid
  │       └── my-section.liquid
  ├── melter.config.js
+ ├── hello-to-hi-plugin.js
  ├── package-lock.json
  └── package.json
```

**hello-to-hi-plugin.js**

```js
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
```

Now add this to your melter config:

```diff
+ const HelloToHiPlugin = require('./hello-to-hi-plugin.js');

  /** @type {import("@unshopable/melter").MelterConfig} */
  const melterConfig = {
    paths: {
      sections: [
        /sections\/[^\/]*\.liquid$/,
        /sections\/legacy\/[^\/]*\.liquid$/,
      ],
      snippets: [
        /components\/[^\/]*\.liquid$/,
        /snippets\/[^\/]*\.liquid$/,
      ],
    },

+   plugins: [
+     new HelloToHiPlugin(),
+   ],
  };

  module.exports = melterConfig;
```

Then, run:

```sh
$ npx melter

...

Successfully compiled in x ms
```

Open `dist/sections/my-section.liquid`. You should see the following content:

```html
<div>Hi, World!</div>
```

Once again, this is only a super basic example to get to know the capabilities of melter. To see what's possible, check out already existing plugins:

### Official Plugins

- [melter-plugin-liquidx](https://github.com/unshopable/melter-plugin-liquidx)

### Community Plugins

- ...

### Custom Plugins

We encourage you to publish your custom plugin(s) so other developers can benefit from them as well.

To make it easy for other developers to find your plugins, please follow these conventions:

- Prefix it with `melter-plugin-` (e.g. `melter-plugin-hello-to-hi`)
- Include the `melter` and `melter-plugin` keyword in your plugin's `package.json`

## Contributing

TODO

## License

[MIT](LICENSE)
