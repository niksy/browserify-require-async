var path = require('path');
var url = require('url');
var resolve = require('browser-resolve');
var through = require('through2');
var falafel = require('falafel');
var _ = require('lodash');
var removeTrailingSlash = require('remove-trailing-slash');
var defaultConfig = require('./lib/config');
var meta = require('./lib/meta');
var Bundle = require('./lib/bundle');
var config;
var instanceCache = [];

function shouldParseFile ( file ) {
	return _.contains(config.extensions, path.extname(resolve.sync(file, { filename: file })));
}

function isRequireAsync ( node ) {

	var c = node.callee;

	return c &&
	node.type === 'CallExpression' &&
	c.type === 'MemberExpression' &&
	(c.object && c.object.type === 'Identifier' && c.object.name === 'require') &&
	(c.property && c.property.type === 'Identifier' && c.property.name === 'async');

}

function getDepsChain ( deps, file ) {
	return _.chain(deps)
		.map(function ( dep ) {
			try {
				return {
					file: resolve.sync(dep, { filename: file }),
					expose: dep
				};
			} catch ( e ) {
				throw new Error(e);
			}
		})
		.value();
}

function getNewBundles ( depsChain ) {
	return _.chain(depsChain)
		.reject(function ( opts ) {
			return _.contains(_.pluck(instanceCache, 'input'), opts.file);
		})
		.map(function ( opts ) {
			var b = new Bundle(_.extend({}, opts, {
				config: config
			}));
			instanceCache.push(b);
			return b;
		})
		.value();
}

function getAllBundles ( depsChain ) {
	return _.chain(depsChain)
		.map(function ( opts ) {
			return _.findWhere(instanceCache, { input: opts.file });
		})
		.value();
}

function transform ( file, opts ) {

	var rootUrl;
	config = _.extend({}, defaultConfig, opts);

	rootUrl = removeTrailingSlash(config.url) + '/';

	return through(function ( buf, enc, next ) {

		var content = buf.toString('utf8');
		var transformedContent;

		if ( !shouldParseFile(file) ) {
			this.push(content);
			next();
			return;
		}

		transformedContent = falafel(content, function ( node ) {

			var arg, deps, depsChain, newBundles, allBundles;

			if ( isRequireAsync(node) ) {

				node.callee.update('require(' + JSON.stringify(meta.name + '/loader') + ')(require, ' + JSON.stringify(rootUrl) + ')');
				arg = node.arguments[0];

				if ( arg.type === 'ArrayExpression' ) {
					deps = _.pluck(arg.elements, 'value');
				} else {
					deps = [arg.value];
				}

				depsChain = getDepsChain(deps, file);
				newBundles = getNewBundles(depsChain);
				allBundles = getAllBundles(depsChain);

				_.invoke(newBundles, 'create');
				_.invoke(newBundles, 'write');

				arg.update(JSON.stringify(_.invoke(allBundles, 'getConfig')));

			}

		});

		this.push(transformedContent.toString());
		next();

	});

}

module.exports = transform;
