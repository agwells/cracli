# CRACLI: Create React App CLI helper

CRACLI is a utility to help with this scenario:

1. You've created a project with [Create React App](https://create-react-app.dev/) (CRA)
2. You've written up some utility functions as part of the project.
3. You want to quickly execute those functions on their own, perhaps in the Node REPL or maybe in a quick standalone CLI script
4. You naively try `node src/scratch.ts` and this happens:

```
> node src/scratch.ts
/home/me/project/src/scratch.tsx:1
import React from 'react';
       ^^^^^

SyntaxError: Unexpected identifier
    at Module._compile (internal/modules/cjs/loader.js:723:23)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:831:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)
```

... so you sigh and start writing up a Jest test or a Storybook story, or just toss some `console` statements into an otherwise unrelated screen of your application.

With CRACLI you would instead do `$(npm bin)/cracli src/scratch.ts`:

```
> $(npm bin)/cracli src/scratch.ts

Hello, world!
```

## Why does that "Unexpected identifier" happen?

CRA uses Babel and Webpack to compile and bundle your JavaScript and static assets into a form that can run in a web browser. While it's doing that, it also adds some additional language features, which are not supported in Node. Specifically:

- ES6 `import` and `export` (instead of CommonJS `require()`)
- Importing non-JS/JSON files as modules
- Import paths relative to `src` (instead of relative to the current file)
- TypeScript

The lack of support for `import` and `export` in node is the reason you see the "Unexpected identifier" error. Node 12 [adds support](https://nodejs.org/docs/latest-v12.x/api/esm.html#esm_enabling) for this sort of import, and Node 13 [enables it by default](https://nodejs.org/docs/latest-v12.x/api/esm.html#esm_enabling), but even then you'll still have problems if you're using the other features mentioned above.

## How does CRACLI help?

CRACLI uses [@babel/register](https://babeljs.io/docs/en/babel-register) to modify the default Node `require()` method so that it compiles all imported files through Babel, using these settings:

- CRA's own `babel-preset-react-app` Babel configuration preset, which takes care of TypeScript (if enabled) and sundry other custom JS syntax
- [babel-plugin-module-resolver](https://www.npmjs.com/package/babel-plugin-module-resolver) to handle all the import-related things CRA normally takes care of with Webpack:
  - converting `import` to `require()`
  - resolving `src`-relative import paths
  - providing a mock module for imported image and CSS files

This makes everything runnable in a normal Node environment!

## TODO

This package is still very much in its proof-of-concept stage. Things remaining to do:

1. Tests!
2. ~~Actually put `index.js` in the `bin` for this module~~
3. Checking for flexibility -- can this utility handle all the different config options that CRA provides, or does it only work for the way I tend to use CRA?
4. Better mock image imports? (e.g. read the actual requested file and provide its content in the module?)
5. Streamline REPL usage
6. Command-line args & help
7. ~~See if it could work as a globally installed package~~
8. Support for compiled scripts? And/or CLI webpack (pretty much required to get CSS and SCSS imports working)
9. See if you can mung the module resolution to force it to use react-script's install of babel instead of having to list it as its own dependency

## Could I use this for Server-Side Rendering?

Sort of. That is in fact what I initially wrote it for.

But before you head down that road, you should know you don't need to use something like this for the standard SSR use-case of pre-loading a static HTML version of your page which gets "hydrated" into the live version (see [CRA's documentation](https://create-react-app.dev/docs/pre-rendering-into-static-html-files) for that).

You may need something like CRACLI if you want to do something more complicated that requires writing your own server in Node, such as rendering your site to "finished" static HTML (perhaps for conversion to another format like PDF), or for rendering portions of your site that are behind a login.

That said, this iteration of CRACLI does not fully support SSR. It doesn't handle images and CSS/SCSS the way CRA does. That's because CRA handles those things through Webpack "loader" plugins, and this iteration of CRACLI only uses CRA's Babel config, not its Webpack config.

In the project that inspired me to write CRACLI (this Babel-only version), I went on to replace it with a setup that tweaks CRA's Webpack config to compile CRA-compatible code into an Express.js server that runs in Node, and that can also compile SCSS and serve up style and image assets the same way a standard CRA project can. I would like to eventually package that up and publish it as well, but it's more of a challenge to figure out what parts of it can be packaged in a way that is generic enough to be used outside my own project.
