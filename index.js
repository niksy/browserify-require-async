var path = require('path');
var acorn = require('acorn');
var acornLoose = require('acorn/dist/acorn_loose');
var resolve = require('browser-resolve');
var through = require('through2');
var falafel = require('falafel');
var _ = require('lodash');
var removeTrailingSlash = require('remove-trailing-slash');
var multimatch = require('multimatch');
var defaultConfig = require('./lib/config');
var meta = require('./lib/meta');
var Bundle = require('./lib/bundle');
var config;
var instanceCache = [];

function shouldParseFile ( file ) {
	var fullFilePath = resolve.sync(file, { filename: file, paths: config.modulePaths });
	return _.contains(config.extensions, path.extname(fullFilePath)) && !multimatch(fullFilePath, config.exclude, { dot: true }).length;
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
					file: resolve.sync(dep, { filename: file, paths: config.modulePaths }),
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

	var urlRoot, parseContent;
	var newBundles = [];

	config = _.extend({}, defaultConfig, opts);
	config.modulePaths = _.map(config._flags.paths, function ( p ) {
		return path.resolve(process.cwd(), p);
	});

	urlRoot = removeTrailingSlash(config.url) + '/';

	parseContent = function ( content, options, next ) {

		var transformedContent = falafel(content, _.extend({}, { parser: acorn, ecmaVersion: 6 }, options), function ( node ) {

			var arg, deps, depsChain, allBundles;

			if ( isRequireAsync(node) ) {

				node.callee.update('require(' + JSON.stringify(meta.name + '/loader') + ')(require, ' + JSON.stringify({
					urlRoot: urlRoot,
					rethrowError: Boolean(config.rethrowError)
				}) + ')');
				arg = node.arguments[0];

				if ( arg.type === 'ArrayExpression' ) {
					deps = _.pluck(arg.elements, 'value');
				} else {
					deps = [arg.value];
				}

				depsChain = getDepsChain(deps, file);
				newBundles = newBundles.concat(getNewBundles(depsChain));
				allBundles = getAllBundles(depsChain);

				arg.update(JSON.stringify(_.invoke(allBundles, 'getConfig')));

			}

		});

		next(null, transformedContent.toString());

	};

	return through(function ( buf, enc, next ) {

		var content = buf.toString('utf8');

		if ( !shouldParseFile(file) ) {
			next(null, content);
			return;
		}

		try {
			// Try parsing with default Acorn settings
			parseContent(content, {}, next);
		} catch ( err1 ) {
			if ( config.looseParseMode ) {
				try	{
					// If default Acorn parsing fails, try with loose mode
					parseContent(content, { parser: { parse: acornLoose.parse_dammit } }, next);
				} catch ( err2 ) {
					// If all else fails, log error
					next(err2, content);
				}
			} else {
				next(err1, content);
			}
		}

	}, function ( cb ) {
		_.invoke(newBundles, 'create');
		_.invoke(newBundles, 'write');
		cb();
	});

}

module.exports = transform;
