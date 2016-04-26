/* eslint-disable no-implicit-coercion, no-shadow */

var Promise = require('lie');
var loader = require('little-loader');
var cache = global.__requireAsyncCache = global.__requireAsyncCache || {};

function createBundlePromise ( opts, _require, urlRoot ) {

	return Promise.resolve()
		.then(function () {
			return _require('' + opts.name);
		})
		.catch(function () {
			return new Promise(function ( resolve, reject ) {
				loader(urlRoot + opts.url, function ( err ) {
					if ( err ) {
						return reject(err);
					}
					try {
						resolve(_require('' + opts.name));
					} catch ( err1 ) {
						if ( /require.async/.test(err1) ) {
							return reject(Error(err1));
						}
						try {
							resolve(_require('' + opts.hash));
						} catch ( err2 ) {
							reject(Error(err1));
						}
					}
				});
			});

		});
}

module.exports = function ( _require, options ) {

	return function ( el, cb, errCb ) {

		var bundles = [].concat(el);
		var promises = [];
		var bundle, i, bundlesLength;

		for ( i = 0, bundlesLength = bundles.length; i < bundlesLength; i++ ) {
			bundle = bundles[i];
			if ( !cache[bundle.hash] ) {
				cache[bundle.hash] = createBundlePromise(bundle, _require, options.urlRoot);
			}
			promises.push(cache[bundle.hash]);
		}

		return Promise.all(promises)
			.then(function ( reqs ) {
				return cb && cb.apply(null, reqs);
			})
			.catch(function ( err ) {
				if ( options.rethrowError ) {
					return setTimeout(function () {
						throw err;
					}, 0);
				}
				return errCb && errCb(err);
			});

	};

};
