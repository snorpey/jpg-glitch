/*global define*/
define(
	function()
	{
		var signals;
		var feature;

		function init( shared )
		{
			feature = shared.feature;
			signals = shared.signals;

			if ( feature['drag-drop' ] )
			{
				document.addEventListener( 'drop', dropped, false );
				document.addEventListener( 'dragover', preventDefault, false );
				document.addEventListener( 'dragleave', preventDefault, false );
			}
		}

		function preventDefault( event )
		{
			event.preventDefault();
		}

		function dropped( event )
		{
			event.preventDefault();

			if (
				event.dataTransfer &&
				event.dataTransfer.files &&
				event.dataTransfer.files[0]
			)
			{
				signals['load-file'].dispatch( event.dataTransfer.files[0] );
				signals['close-intro'].dispatch();
			}
		}

		return { init: init };
	}
);