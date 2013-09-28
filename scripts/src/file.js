/*global define*/
define(
	function()
	{
		var signals;
		var reader;
		var feature;
		var allowed_file_types = [ 'image/png', 'image/jpg', 'image/jpeg' ];

		function init( shared )
		{
			signals = shared.signals;
			feature = shared.feature;

			if ( feature['file-api' ] )
			{
				signals['load-file'].add( loadFile );
				reader = new FileReader();
				reader.addEventListener( 'load', fileLoaded, false );
			}
		}

		function loadFile( file )
		{
			if (
				file &&
				file.type &&
				allowed_file_types.indexOf( file.type ) !== -1
			)
			{
				reader.readAsDataURL( file );
			}
		}

		function fileLoaded( event )
		{
			signals['set-new-src'].dispatch( event.target.result );
		}

		return { init: init };
	}
);