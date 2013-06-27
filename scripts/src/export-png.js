/*global define*/
define(
	function()
	{
		var signals;
		var png_button;

		function init( shared )
		{
			signals = shared.signals;
			png_button = document.getElementById( 'png-button' );

			signals['export-png'].add( generatePNG );
			signals['control-updated'].add( hideLink );
			png_button.addEventListener( 'click', hideLink, false );
		}

		function generatePNG( data_url )
		{
			png_button.href = data_url;
			png_button.classList.add( 'is-active' );
		}

		function hideLink()
		{
			png_button.classList.remove( 'is-active' );
		}

		return { init: init };
	}
);