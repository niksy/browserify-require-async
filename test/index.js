document.querySelector('button').addEventListener('click', function () {

	require.async('jquery', function () {
		console.log(arguments);
	});

	require.async(['jquery', 'plugin'], function () {
		console.log(arguments);
	});

	require.async('plugin', function () {
		console.log(arguments);
	});

	require.async('jquery', function () {
		console.log(arguments);
	});

	require.async('plugin', function () {
		console.log(arguments);
	});

	require.async('plugin', function () {
		console.log(arguments);
	});

	require.async('jquery', function () {
		console.log(arguments);
		require.async('underscore', function () {
			console.log(arguments);
			require.async('plugin', function () {
				console.log(arguments);
			});
		});
	});

	require.async(['jquery', 'underscore', 'plugin', './index1.css', './package.json', './template.nunj'], function ( $, _, plugin, css, pkg, tmpl ) {
		console.warn($);
		console.warn(_);
		console.warn(plugin);
		console.warn(css);
		console.warn(pkg);
		console.warn(tmpl.render({ foo: 'FOO' }));
	});

});
