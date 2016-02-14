var css = require('./index1.css');

require.async('underscore', function () {
	console.log(1);
	require.async('plugin', function () {
		console.log(2);
	});
});

module.exports = 'a';
