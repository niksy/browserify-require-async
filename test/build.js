var path = require('path');
var browserify = require('browserify');
var fs = require('fs');
var tr = require('./simple-transform');
var source = require('vinyl-source-stream');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var vinylToStream = require('vinyl-to-stream');
var watchify = require('watchify');
var cssify = require('cssify');
var browserify = require('browserify');
var collapse = require('bundle-collapser/plugin');
var vinylToStream = require('vinyl-to-stream');

var foo = [tr, {
	setup: function ( b, opts ) {
		b.external('browserify-require-async/loader');
		b.external('nunjucks');
		b.external('nunjucksify/runtime-shim');
		b.transform(cssify);
		b.transform.apply(b, foo);
		return b;
	},
	bundle: function ( b, opts ) {
		return b.bundle()
			.pipe(source(opts.outputFile))
			.pipe(buffer())
			// .pipe(uglify())
			.pipe(vinylToStream())
	}
}];

var b = browserify();
b.add('./index.js');
b.require('browserify-require-async/loader');
b.require('nunjucks');
b.require('nunjucksify/runtime-shim');
b.transform(cssify);
b.transform.apply(b, foo);

b.on('update', bundle);
bundle();

function bundle() {
	b.bundle().pipe(fs.createWriteStream('./out/out.js'));
}
