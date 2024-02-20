# postcss-classname-obfuscator

This PostCSS plugin replaces CSS class names with hard-to-guess characters.

> It may not work properly if the `.next` folder exists.
> Demo Site: https://postcss-classname-obfuscator-demo.vercel.app/

```css
.primary {
  color: var(--primary);
}

.secondary {
  color: var(--secondary);
}
```

```css
.b6d946 {
  color: var(--primary);
}

.d6bdb8 {
  color: var(--secondary);
}
```

## Usage

**Step 1:** Install plugin:

```bash
npm install --save-dev postcss postcss-classname-obfuscator
```

**Step 2:** Check your project for existing PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: {
    autoprefixer: {},
+   'postcss-classname-obfuscator': {},
  },
};
```

## Options

| Option          | Type                | Default                 | Description                                                           |
| --------------- | ------------------- | ----------------------- | --------------------------------------------------------------------- |
| type            | string              | "nextjs"                | "nextjs" - Application-specific directories Only supported by Next.js |
| enable          | boolean             | true                    | Enable or disable the obfuscation.                                    |
| length          | number              | 6                       | Character length (max. 32 characters)length.                          |
| method          | string              | "random"                | "random" or "none" obfuscation method for classes.                    |
| prefix          | string              | ""                      | Prefix for custom properties.                                         |
| suffix          | string              | ""                      | Suffix for custom properties.                                         |
| ignore          | string[]            | []                      | Array of custom properties to ignore.                                 |
| output          | string              | ""                      | Obfuscated property list json file output destination                 |
| directory       | string              | ""                      | Directory to replace obfuscated class names                           |
| [new] inputJson | string              | ""                      | The json output by output is available.                               |
| ignoreRegex     | string[]            | []                      | Regex to ignore.                                                      |
| hashAlgorithm   | string              | "sha256"                | Hash algorithm for obfuscation.                                       |
| preRun          | () => Promise<void> | () => Promise.resolve() | What to do before running the plugin                                  |
| callBack        | () => void          | function () {}          | Callback function to run after the plugin has finished running        |

## License

This source code is released under the [MIT license.]

[MIT license.]: https://opensource.org/licenses/MIT
[official docs]: https://github.com/postcss/postcss#usage
