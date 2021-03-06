# browserify-require-async

Browserify transform to handle [`require.async`](require-async) calls.

**Highly experimental.**

## Install

```sh
npm install browserify-require-async --save
```

## Usage

Following application will require `./foo` with standard mechanism, but modules `path`, `url`, `querystring` and `./bar` will be required asynchronously and parsed with provided [configuration options][config].

Requiring `path` provides you with the error callback so you can handle any potential errors.

```js
var foo = require('./foo');

require.async('path', function ( path ) {
	path.join('foo', 'bar');
}, function ( err ) {
	console.error(err);
});

require.async(['url', 'querystring'], function ( url, qs ) {
	var parsedUrl = url.parse('http://example.com');
	var parsedQs = qs.parse('foo=1&bar=2');
});

require.async('./bar', function ( bar ) {
	// Do something with "bar"
});
```

### Transform

#### package.json

```json
{
	"browserify": {
		"transform": [
			"browserify-require-async"
		]
	},
	"browserify-require-async": {
		"outputDir": "/"
	}
}
```

Some configuration options like custom output filename can’t be set with `package.json` configuration, so it’s best to define it with Node module.

#### Node module

```js
var browserify = require('browserify');
var bra = require('browserify-require-async');

var b = browserify('./index.js');
b.transform(bra, {
	// Custom config
});

b.bundle().pipe(fs.createWriteStream('./bundle.js'));
```

## API

### url

Type: `String`  
Default: `/`

Base URL for every asynchronously loaded module.

### outputDir

Type: `String`  
Default: ` `

Directory where asynchronously loaded modules will be written.

### setOutputFile

Type: `Function`  
Returns: `String`

Set file name of the module. By default, file name is created as MD5 hash of filename and last modified time.

| Argument | Type | Description |
| --- | --- | --- |
| `hash` | `String` | MD5 hash of filename and last modified time. |
| `opts` | `Object` | File and directory information. |

#### `opts`

| Argument | Type | Description |
| --- | --- | --- |
| `inputDir` | `String` | Input directory. |
| `inputFile` | `String` | Input file. |

### extensions

Type: `Array`  
Default: `['.js']`

List of file extensions which will be considered when parsing module content.

### exclude

Type: `Array`  
Default: `['**/node_modules/**']`

List of [multimatch][multimatch] expressions (files) which will be exluded from parsing. Useful when you use [recursive parsing](#first-level-only) or you want to exlude `node_modules` files.

By default, all files inside `node_modules` (local or global) will be excluded, as per default Browserify behavior. If you want to operate on some module inside `node_modules`, you should explicitly declare it (e.g. to operate on files for module `foo`, use `!**/node_modules/foo/**`; note that using only that value will override default behavior, to have default and new behavior, you should concatenate arrays/values).

### looseParseMode

Type: `Boolean`  
Default: `false`

By default, transform will use default settings when parsing files with [acorn][acorn] (through [falafel][falafel]). Sometimes there are files with specific syntax errors which can be adjusted with acorn’s [loose mode][acorn-loose-mode]. Setting this option to true will first use default settings, and if those settings fail, it will try to use loose mode settings, and if that fails, it will inform you of error which caused failed parsing.

### rethrowError

Type: `Boolean`  
Default: `false`

By default, loader expects you to handle errors in error callback and will "swallow" errors if they are not properly handled. Set this option to `true` to rethrow error and show those errors in e.g. your web console (useful for testing purposes).

### setup

Type: `Function`  
Returns: Browserify instance

By default, transform will setup some minimum requirements for asynchronous module Browserify instance (external require and such).
This callback is useful if you need to define some custom transforms, requires, plugins and any other feature provided with Browserify.

| Argument | Type | Description |
| --- | --- | --- |
| `instance` | `Browserify` | Browserify instance, with some original instance options applied (`debug`). |
| `opts` | `Object` | File and directory information. |

#### `opts`

| Argument | Type | Description |
| --- | --- | --- |
| `inputDir` | `String` | Input directory. |
| `inputFile` | `String` | Input file. |
| `outputDir` | `String` | Output directory. |
| `outputFile` | `String` | Output file. |

### bundle

Type: `Function`  
Returns: Optionally `Stream`

By default, transform will use standard Browserify bundling and writing to file system.
This callback is useful if you need to do some postprocessing on bundle stream such as running Gulp tasks.

If you return [`Stream`][node-stream], transform will write it to proper output location. Otherwise, you can handle writing yourself with standard file system modules or with task runner such as [Gulp][gulp].

| Argument | Type | Description |
| --- | --- | --- |
| `bundle` | `Browserify` | Browserify instance, with some original instance options applied (`debug`). |
| `opts` | `Object` | File and directory information. |

#### `opts`

| Argument | Type | Description |
| --- | --- | --- |
| `inputDir` | `String` | Input directory. |
| `inputFile` | `String` | Input file. |
| `outputDir` | `String` | Output directory. |
| `outputFile` | `String` | Output file. |

## Examples

### Transform

Custom instance setup.

```js
var browserify = require('browserify');
var cssify = require('cssify');
var bra = require('browserify-require-async');

var b = browserify('./index.js');
b.transform(bra, {
	setup: function () {
		var b = browserify();
		b.transform(cssify);
		return b;
	}
});

b.bundle().pipe(fs.createWriteStream('./bundle.js'));
```

Custom bundle setup.

```js
var browserify = require('browserify');
var bra = require('browserify-require-async');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

var b = browserify('./index.js');
b.transform(bra, {
	bundle: function ( b, opts ) {
		b.bundle()
			.pipe(source(opts.outputFile))
			.pipe(buffer())
			.pipe(uglify())
			.pipe(gulp.dest(opts.outputDir));
	}
});

b.bundle().pipe(fs.createWriteStream('./bundle.js'));
```

Returning Stream from custom bundle. If the stream is [Vinyl stream][vinyl] (like when you use Gulp tasks), you need to convert it to standard text stream.

```js
var browserify = require('browserify');
var bra = require('browserify-require-async');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var vinylToStream = require('vinyl-to-stream');

var b = browserify('./index.js');
b.transform(bra, {
	bundle: function ( b, opts ) {
		return b.bundle()
			.pipe(source(opts.outputFile))
			.pipe(buffer())
			.pipe(uglify())
			.pipe(vinylToStream())
	}
});

b.bundle().pipe(fs.createWriteStream('./bundle.js'));
```

## Node usage

Node doesn’t support `require.async` so if you want to have universal JavaScript code, [use polyfill][polyfill].

## Caveats

### First level only

Transform is applied only on first level instances. If you have asynchronous module requests inside asynchronous module requests, you must explictly apply transformation. One way to do it is to make it recursive.

```js
var browserify = require('browserify');
var bra = require('browserify-require-async');

var config = [bra, {
	setup: function () {
		var b = browserify();
		b.transform.apply(b, config);
		return b;
	}
}];

var b = browserify('./index.js');
b.transform.apply(b, config);
```

### Usage with [bundle-collapser][bundle-collapser]

If you’re using bundle-collapser, local bundle requires won’t be properly collapsed and you will receive errors. Unfortunately, bundle-collapse in its current iteration doesn’t provide us with the option of setting custom parsing mecahnism, but I’m maintaining a [fork][bundle-collapser-fork] which can do just that and you can use it.

If you find this useful, consider upvoting [issue on upstream][bundle-collapser-issue] so it can be merged!

Here’s definition for asynchronous module collapsing.

```js
var browserify = require('browserify');
var collapse = require('bundle-collapser-extended/plugin');

var b = browserify();
b.plugin(collapse, {
	preset: [
		'browserify-require-async'
	]
});
```

### Loader slimming

By default, every bundle which uses asynchronous loading will also include [custom loader][custom-loader]. Loader is needed only in one place and can be exposed through global require, so you can use a require/external combination provided with Browserify to require it only once.

```js
var browserify = require('browserify');

var b = browserify('./index.js');
var main = browserify('./main.js');

b.require('browserify-require-async/loader');
main.external('browserify-require-async/loader');

b.bundle().pipe(fs.createWriteStream('./bundle.js'));
main.bundle().pipe(fs.createWriteStream('./main.bundle.js'));
```

### Watch mode

By default, generated filename is a hash of changed file stats. This is inconvenient in development/watch mode since bundle source won’t be properly updated. To avoid this, you can have condition in watch mode and production mode which will produce different output file.

```js
var browserify = require('browserify');
var bra = require('browserify-require-async');

var b = browserify('./index.js');
b.transform(bra, {
	setOutputFile: function ( hash, opts ) {
		if ( process.env.NODE_ENV === 'development' ) {
			return opts.inputFile;
		}
		return hash + '.js';
	}
});

b.bundle().pipe(fs.createWriteStream('./bundle.js'));
```

### Gulp, multiple bundles and done callback

When using build tools like Gulp, handling multiple bundles and done callbacks can be properly done following way:

```js
var gulp = require('gulp');
var es = require('event-stream');

gulp.task('script', function ( done ) {

	var tasks = []; // Top level bundles array streams
	var subTasks = []; // Async level bundles array streams

	// Your Gulp tasks

	es.merge(tasks)
		.on('data', function () {})
		.on('end', function () {
			es.merge(subTasks)
				.on('data', function () {})
				.on('end', done);
		});
	
});
```

### Running transforms inside `node_modules`

If you want to shim module inside `node_modules` directory which is required directly (and not as part of local file), you should set transform explictly.

```js
if ( minimatch(fileName, '**/node_modules/{foo,bar}/**') ) {
  b.transform('browserify-shim');
}
```

## Q&A

### This is similar to [Webpack code splitting][webpack-code-splitting]?

Yes, but with different version of syntax and aligned with standard Browserify features.

### Why not `require.ensure` like Webpack?

I’ve found it harder to parse file content for all the standard `require` references and transforming them to custom `require` calls, but it can probably be done.
It’s also possible to create [Babel][babel] plugin which will transform `require.ensure` to `require.async` and then afterwards apply this transformation.

Also, I think that `require.async` closesly aligns with [proposed ES6 `System.import` syntax][es6-system-import] (uses Promises, callback arguments are exports, …) so it’s easier to reason about and write code which is somewhat future-friendly. And also, it’s a candidate for Babel plugin, even easier to write than `require.ensure` one.

## References

* [`require.async` rules - 2.V][require-async-rules]

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[require-async-description]: http://wiki.commonjs.org/index.php?title=Modules/Async/A&oldid=2487
[require-async-rules]: https://github.com/kriskowal/uncommonjs/blob/master/modules/specification.md#guarantees-made-by-module-interpreters
[polyfill]: https://github.com/pinf/require.async
[bundle-collapser]: https://github.com/substack/bundle-collapser
[bundle-collapser-fork]: https://github.com/niksy/bundle-collapser-extended
[bundle-collapser-issue]: https://github.com/substack/bundle-collapser/issues/16
[custom-loader]: loader.js
[config]: #api
[node-stream]: https://nodejs.org/api/stream.html
[gulp]: http://gulpjs.com/
[vinyl]: https://github.com/gulpjs/vinyl
[webpack-code-splitting]: https://webpack.github.io/docs/code-splitting.html
[babel]: http://babeljs.io/
[es6-system-import]: http://exploringjs.com/es6/ch_modules.html#_loader-method-importing-modules
[multimatch]: https://github.com/sindresorhus/multimatch
[acorn]: https://github.com/ternjs/acorn
[falafel]: https://github.com/substack/node-falafel
[acorn-loose-mode]: https://github.com/ternjs/acorn#distacorn_loosejs
