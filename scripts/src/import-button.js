/*global define*/
define(
	[ 'util/trigger-event' ],
	function( triggerEvent )
	{
		var feature;
		var signals;
		var import_button;
		var import_input;
		var file_reader;
		var image;
		var file_loading = false;
		var allowed_file_types = [ 'image/png', 'image/jpg', 'image/jpeg' ];

		function init( shared )
		{
			signals = shared.signals;
			feature = shared.feature;

			// http://www.html5rocks.com/en/tutorials/file/dndfiles/
			if ( feature['file-api' ] )
			{
				file_reader = new FileReader();

				import_button = document.getElementById( 'import-button' );
				import_input = document.getElementById( 'import-input' );

				file_reader.addEventListener( 'load', fileLoaded, false );
				import_button.addEventListener( 'click', buttonClicked, false );
				import_input.addEventListener( 'change', fileSelected, false );
			}
		}

		function buttonClicked( event )
		{
			event.preventDefault();

			if ( ! file_loading )
			{
				triggerEvent( import_input, 'click' );
			}
		}

		function fileSelected( event )
		{
			var files = event.target.files;

			if (
				files[0] &&
				files[0].type &&
				allowed_file_types.indexOf( files[0].type ) !== -1
			)
			{
				file_reader.readAsDataURL( files[0] );
			}
		}

		function fileLoaded( event )
		{
			signals['set-new-src'].dispatch( event.target.result );
		}

		return { init: init };
	}
);