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
				event.target &&
				event.target.files &&
				event.target.files[0]
			)
			{
				signals['load-file'].dispatch( event.target.files[0] );
				signals['close-intro'].dispatch();
			}
		}

		return { init: init };
	}
);