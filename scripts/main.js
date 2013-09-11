/*global require, requirejs, define, Modernizr, _basepath_ */
// http://requirejs.org/docs/api.html#config 
var path = typeof _basepath_ === 'string' ? _basepath_ + '/' : '';
requirejs.config(
	{
		baseUrl: path + 'scripts/',
		waitSeconds: 5,
		urlArgs: 'bust=' +  ( new Date() ).getTime(),
		shim: {
			'lib/delaunay': { exports: 'triangulate' }
		}
	}
);

require(
	[
		'src/process',
		'src/image',
		'src/dragdrop',
		'src/controls',
		'src/export-png',
		'src/save-button',
		'util/feature-test',
		'lib/signals-1.0.0',
		'lib/html5slider'
	],
	function(
		process,
		image,
		dragdrop,
		controls,
		png,
		save_button,
		testFeatures,
		Signal
	)
	{
		testFeatures( init, showError );

		function init( supported_features )
		{
			var shared = {
				feature: supported_features,
				signals: {
					'image-loaded'    : new Signal(),
					'set-new-src'     : new Signal(),
					'control-updated' : new Signal(),
					'export-png'      : new Signal(),
					'saved'           : new Signal()
				}
			};

			process.init( shared );
			dragdrop.init( shared );
			controls.init( shared );
			png.init( shared );
			save_button.init( shared );
			image.init( shared );
		}

		function showError( required_features )
		{
			var message = document.createElement( 'div' );

			var message_text = 'sorry. it looks like your browser is missing some of the features ';
			message_text += '(' + required_features.join( ', ' ) + ') that are required to run this ';
			message_text += 'experiment.';

			message.innerText = message_text;
			message.className = 'missing-feature';

			document.getElementsByTagName( 'body' )[0].appendChild( message );
		}
	}
);