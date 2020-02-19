/**
 * This file is the "Launch" script for rendering our React JS at the command
 * line. It calls "@babel/register", which is a Babel utility that hijacks
 * the normal node "require()" function and lets Babel pre-compile imported
 * files into Node-compatible JS before they're executed.
 *
 * This bootstraps up the fancy CRA TypeScript/React configuration (using the
 * Babel config imported from "babel-preset-react-app"). Then it simply invokes
 * whichever script was requested (or launches the node REPL)
 *
 * To execute:
 *
 * > cd path/to/my/project
 * > cracli src/something.js
 */

// Ensure environment variables are read.
// We need to tell CRA to use the "test" environment so it will make everything
// command-line friendly.
// @ts-ignore
process.env.NODE_ENV = "test";
// @ts-ignore
process.env.PUBLIC_URL = "http://example.com";

const path = require("path");
const defaultResolver = require("babel-plugin-module-resolver").resolvePath;

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const config = {
  // THIS LINE is the important one. "babel-preset-react-app" is the Babel
  // configuration that Create React App uses! Importing this, while specifying
  // that NODE_ENV = "test", automatically gives us the same Babel configuration
  // that CRA uses when executing Jest tests in the CLI.
  //
  // NOTE we still have to tweak a couple of additional things, which CRA
  // takes care of through Webpack on the browser-side, and through Jest configs
  // on the CLI.
  presets: ["babel-preset-react-app"],

  // Tell Babel which file extensions to try to compile. (Note that it will
  // by default ignore files imported from node_modules, which is good.)
  extensions: [".js", ".jsx", ".ts", ".tsx"],

  plugins: [
    [
      require.resolve("babel-plugin-module-resolver"),
      {
        cwd: "packagejson",
        // Simulate "absolute" import paths, e.g. using
        // "import 'components/base/button/button';" instead of
        // "import '../../../../components/base/button/button';"
        // CRA does this by examining your tsconfig.json file and then configuring
        // Webpack (for browser) or a "--modules" flag (for Jest)
        root: ["./src/"],
        extensions: [
          // Code files
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
          // Files to replace with empty placeholders
          ".scss",
          ".css",
          ".svg",
          ".png"
        ],
        // Ignore the CSS/SVG import syntax "import 'button.scss';"
        // Specifically, the import is still there, but we rewrite it to import
        // an empty file.
        resolvePath(sourcePath, currentFile, opts) {
          if (/\.(scss|css|svg|png)$/.test(sourcePath)) {
            return path.resolve(__dirname, "placeholder");
          } else {
            return defaultResolver(sourcePath, currentFile, opts);
          }
        }
      }
    ]
  ]
};

require("@babel/register")(config);
