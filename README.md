This repository enables more effective development for MediaWiki:Common.js than attempting to edit a 5500-line monolithic file.

## Usage

[Common.min.js](out/Common.min.js) is built by minifying the contents of all files in the [lib](lib) folder tree.  To perform the build, first install dependencies:

```shell
npm install
```

Then execute the build:

```shell
npm run build
```

## Development guidelines

1. Currently, all Javascript must be ECMAScript 5 because this is what is supported by uglify-js.
2. All code in individual files should consist of function or constant definitions with the exception of `global_variables.js` and `zzz_onload.js`.
3. Constants may be defined in the file/folder to which they pertain, but:
   1. Every constant should be in CAPITAL_CASE for recognizability.
   2. No constant should ever be written except for initial assignment.
4. All global variables must be defined in `global_variables.js`
   1. Only use global variables when necessary.  Local variables should be strongly preferred in general.
5. Automatic function invocations (for instance, on page load) should be centralized in `zzz_onload.js`.

By following the guidelines above, the order each file's content appears in the generated monolithic, minified file should not matter.