# mono-resolver-webpack-plugin

Webpack resolver for mono-repositories

---

1. [Installation](#installation)
1. [Mono-repo support](#mono-repo-support)
1. [Who Needs It](#who-needs-it)
1. [How To Use](#how-to-use)
1. [Alternative solutions](#alternative-solutions)

### Installation

webpack 4+

`yarn add --dev mono-resolver-webpack-plugin`

---

### Mono-repo support

This plugin natively support:

- lerna projects with lerna.json file in the root repository folder.

Need support for other mono-repo libraries? Open an issue or send a PR.

### How To Use

```js
const webpackConfig = {
  // ...
  resolve: {
    // ...
    plugins: [
      //...
      new MonoResolverPlugin({
        // only needed if it IS a lerna mono-repo.
        // if every package in your mono repo is
        // called in npm `@webpack123/package1`, then write `webpack123`.
        npmOrganizationName: 'webpack123',
        // only needed if it is NOT a lerna mono-repo. if it is, this plugin will use lerna-api to get it by it self.
        // list here all your packages folder names and folder locations (only absulote paths).
        packagesProps: [
          { folderName: 'package1', location: '/usr/project123/package1' },
          { folderName: 'package1', location: '/usr/project123/sub-folder1/package2' },
          { folderName: 'package1', location: '/usr/project123/sub-folder2/package3' },
        ],
        // optional. don't do nothing for the following modules in the code; let webpack
        // find thier locations alone or by your other plugins/loaders/webpack-resolve-options.
        // NOTE: for any given module `module1-name` we treat it same as `module1-name(.*)`.
        ignoreModules: ['react', '@webpack123/package1', '@webpack123/package2/f1/g2'],
      }),
    ],
  },
}
```

### Who Needs It

mono-repositories containing packages that compile (using webpack) other
packages (in the same mono-repo) in the same build, will have a bug if
the packages that they compile has a node_modules folder.

Example:

```
- mono-repo
   - node_modules
       - lodash-v1.0.0
   - packages
       - package1 (depends on lodash-v1.0.0)
           - node_modules
       - package2 (depends on lodash-v1.0.0)
           - node_modules
       - package3 (depends on lodash-v2.0.0)
           - node_modules
               - lodash-v2.0.0
```

if, for example, package3's build compiles package1 or package2, then webpack
default-resolver will try to find **_any_** module inside
`mono-repo/packages/package3/node_modules` and if not, then in `mono-repo/node_modules`.

As a result, only `lodash-v2.0.0` will be used. If you are lucky, `lodash-v2.0.0` only changed
the functions signutures so the build will fail. if you are unlucky, `lodash-v2.0.0` has
major change in same same functions as `lodash-v1.0.0` and you will have a sielent bug.

This plugin will fix this problem by searching for **_any_** module that in the
currect `node_modules`: the internal `node_modules` will have a priority.

- Even if lodash uses other module: `module1` and you have this module multiple
  times in your mono-repo in multiple versions, this plugin will still
  search `module1` in the same place it searched for who called it.

- To prevent loading the same module in the same version (that may has a side-effects)
  multiple times from different `node_modules` folders, this plugin will use the first location
  of the same module if there are moltiple requests to it in the same
  version (from multiple packages).

---

Note to user:

if we would talk about `react` instead of `lodash` in the example above:

- without using this plugin, you ensure that you only ever use the same version of `react` in the build because everytime, webpack will find it in `mono-repo/packages/package3/node_modules`. and that's good.
- Using this plugin has a huge risk of a bug if the other packages use different versions of `react` because, this plugin will resolve multiple times `react` in multiple versions.

  solution:

  - Don't use multiple versions of the same module that has a side-effect. this is a cause of troubles.

### Alternative solutions

If this is your folder structure:

```
- mono-repo
   - node_modules
       - lodash-v1.0.0
   - packages
       - package1 (depends on lodash-v1.0.0)
           - node_modules
       - package2 (depends on lodash-v1.0.0)
           - node_modules
       - package3 (depends on lodash-v2.0.0)
           - node_modules
               - lodash-v2.0.0
```

Your options are:

1. don't compile multiple packages (from the same mono-repo) in the same build.
2. remove `node_modules` from `package1` and `package2`.
