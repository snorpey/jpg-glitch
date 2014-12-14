/*global require, requirejs, define */
// http://requirejs.org/docs/api.html#config 
requirejs.config(
	{
		baseUrl: 'scripts/',
		waitSeconds: 50,
		urlArgs: 'bust=' +  ( new Date() ).getTime()
	}
);

require(
	[
		'src/process',
		'src/image',
		'src/file',
		'src/dragdrop',
		'src/controls',
		'src/export-button',
		'src/import-button',
		'src/random-button',
		'src/upload-imgur',
		'src/intro',
		'src/cam',
		'util/feature-test',
		'lib/signals-1.0.0'
	],
	function(
		process,
		image,
		file,
		dragdrop,
		controls,
		export_button,
		import_button,
		random_button,
		imgur,
		intro,
		cam,
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
					'load-file'                : new Signal(),
					'image-loaded'             : new Signal(),
					'set-new-src'              : new Signal(),
					'control-set'              : new Signal(),
					'control-updated'          : new Signal(),
					'close-intro'              : new Signal(),
					'image-data-url-requested' : new Signal()
				}
			};

			process.init( shared );
			dragdrop.init( shared );
			export_button.init( shared );
			controls.init( shared );
			import_button.init( shared );
			random_button.init( shared );
			image.init( shared );
			file.init( shared );
			imgur.init( shared );
			intro.init( shared );
			cam.init( shared );
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