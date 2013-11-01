/*global define*/
define(
	function()
	{
		var signals;
		var export_button;
		var png_link;

		function init( shared )
		{
			signals = shared.signals;
			export_button = document.getElementById( 'export-button' );
			png_link = document.getElementById( 'png-button' );

			export_button.addEventListener( 'click', exportButtonClicked, false );
			png_link.addEventListener( 'click', hidePNGLink, false );
		}

		function exportButtonClicked( event )
		{
			event.preventDefault();

			signals['image-data-url-requested'].dispatch( upldatePNGLinkAddress );
		}

		function upldatePNGLinkAddress( data_url )
		{
			png_link.href = data_url;
			png_link.classList.add( 'is-active' );
		}

		function hidePNGLink()
		{
			png_link.classList.remove( 'is-active' );
		}

		return { init: init };
	}
);