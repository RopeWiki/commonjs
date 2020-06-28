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

Currently, all Javascript must be ECMAScript 5 because this is what is supported by uglify-js.

All code in individual files should consist of function or constant definitions.  Invocations of those functions (for instance, on page load) should be centralized in zzz_onload.js.  By following this guideline, the order each file's content appears in the generated monolithic, minified file should not matter.