var _ = require('lodash');
var pkgConf = require('pkg-conf');
var meta = require('./meta');

module.exports = _.extend({
	url: '/',
	outputDir: '',
	outputFile: null,
	extensions: ['.js'],
	exclude: ['**/node_modules/**'],
	looseParseMode: false,
	rethrowError: false,
	setup: null,
	bundle: null
}, pkgConf.sync(meta.name));
