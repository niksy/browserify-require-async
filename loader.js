var __requireAsyncUrlRoot = '';
var Promise = require('lie');
var loader = require('little-loader');
var cache = global.__requireAsyncCache = global.__requireAsyncCache || {};

function createBundlePromise ( opts, _require ) {

	return Promise.resolve()
		.then(function () {
			return _require('' + opts.name);
		})
		.catch(function () {
			return new Promise(function ( resolve, reject ) {
				loader(__requireAsyncUrlRoot + opts.url, function ( err ) {
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

module.exports = function ( _require ) {

	return function ( el, cb, errCb ) {

		var bundles = [].concat(el);
		var promises = [];

		for ( var i = 0, bundlesLength = bundles.length; i < bundlesLength; i++ ) {
			var bundle = bundles[i];
			if ( !cache[bundle.hash] ) {
				cache[bundle.hash] = createBundlePromise(bundle, _require);
			}
			promises.push(cache[bundle.hash]);
		}

		return Promise.all(promises)
			.then(function ( reqs ) {
				return cb && cb.apply(null, reqs);
			})
			.catch(function ( err ) {
				return errCb && errCb(err);
			});

	};

};
