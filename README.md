This repository enables more effective development of the javascript which powers many features on ropewiki.com

 Rather than attempting to edit a 5500-line monolithic file, the code is broken down in smaller files, which are combined and published to the site:

* [MediaWiki:Common.js](https://ropewiki.com/MediaWiki:Common.js)
* [MediaWiki:Waterflow.js](https://ropewiki.com/MediaWiki:Waterflow.js)

Note mediawiki automatically minifys & mangles the javascript it serves, so the MediaWiki:Common.js wikipage can be kept in a human readable format.

## Usage

[Common.min.js](out/Common.min.js) is built by minifying the contents of all files in the [lib](lib) folder tree.  To perform the build, first install dependencies:

```shell
npm install
```

Then execute the build:

```shell
npm run build
```

## Auto build & upload
`commonjs/upload.py` is a script to take the minify output and upload it to MediaWiki via its API.

Combined with inotify you can automatically run the build and have the output uploaded every time a source file is changed - great for fast developement.

Note: This is broke on MW < 1.27.1, reported here: https://github.com/mwclient/mwclient/issues/257

```
while inotifywait -r -e modify lib; do
    echo "** BUILDING **"; node build.js &&
    echo "** UPLOADING **"; ./upload.py;
done;
```

## Usage (Visual Studio)
If you wish to develop in Visual Studio, there is a 'Ropewiki Javascript.sln' and corresponding project in this repo that you can open. To do the bundling and minify for deployment, install the 'Bundler & Minifier' extension for VS. This extension uses settings in the bundleconfig.json file, and once installed, the files are automatically minified every time a change is saved to the watched files. To deploy, copy and paste the output in to the http://ropewiki.com/MediaWiki:Common.js page in production.

https://marketplace.visualstudio.com/items?itemName=MadsKristensen.BundlerMinifier


## Development guidelines

1. All code in individual files should consist of function or constant definitions with the exception of `global_variables.js` and `zzz_onload.js`.
1. Constants may be defined in the file/folder to which they pertain, but:
   1. Every constant should be in CAPITAL_CASE for recognizability.
   1. No constant should ever be written except for initial assignment.
1. All global variables must be defined in `global_variables.js`
   1. Only use global variables when necessary.  Local variables should be strongly preferred in general.
1. Automatic function invocations (for instance, on page load) should be centralized in `zzz_onload.js`.

By following the guidelines above, the order each file's content appears in the generated monolithic, minified file should not matter.

### Function comments

Whenever practical, try to document functions with a summary of what the function does, the input parameters, and the return value.  Here is a long-form format to model comments after:

```javascript
/**
 * Summary. (use period)
 *
 * Description. (use period)
 *
 * @access     private
 *
 * @see  Function/class relied on
 *
 * @fires   eventName
 * @fires   className#eventName
 * @listens event:eventName
 * @listens className~event:eventName
 *
 * @param {type}   var           Description.
 * @param {type}   [var]         Description of optional variable.
 * @param {type}   [var=default] Description of optional variable with default variable.
 * @param {Object} objectVar     Description.
 * @param {type}   objectVar.key Description of a key in the objectVar parameter.
 *
 * @yield {type} Yielded value description.
 *
 * @return {type} Return value description.
 */
```

