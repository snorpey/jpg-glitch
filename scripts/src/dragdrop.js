/*global define*/
define(
	function()
	{
		var signals;
		var reader;
		var feature;

		function init( shared )
		{
			feature = shared.feature;
			signals = shared.signals;

			if ( feature['drag-drop' ] && feature['file-api' ] )
			{
				document.addEventListener( 'drop', dropped, false );
				document.addEventListener( 'dragover', preventDefault, false );
				document.addEventListener( 'dragleave', preventDefault, false );

				reader = new FileReader();
				reader.addEventListener( 'load', fileLoaded, false );
			}
		}

		function preventDefault( event )
		{
			event.preventDefault();
		}

		function dropped( event )
		{
			event.preventDefault();
			reader.readAsDataURL( event.dataTransfer.files[0] );
		}

		function fileLoaded( event )
		{
			signals['set-new-src'].dispatch( event.target.result );
		}

		return { init: init };
	}
);