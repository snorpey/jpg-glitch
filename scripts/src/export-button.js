/*global define*/
define(
	function()
	{
		var signals;
		var export_button;
		var png_link;
		var default_file_name;
		var file_name;
		var file_suffix = '.png';

		function init( shared )
		{
			signals = shared.signals;
			export_button = document.getElementById( 'export-button' );
			png_link = document.getElementById( 'png-button' );

			default_file_name = png_link.getAttribute( 'download' ).split( file_suffix )[0];
			file_name = default_file_name + file_suffix;

			export_button.addEventListener( 'click', exportButtonClicked, false );
			png_link.addEventListener( 'click', hidePNGLink, false );

			signals['control-updated'].add( updateFileName );
		}

		function exportButtonClicked( event )
		{
			event.preventDefault();

			signals['image-data-url-requested'].dispatch( updatePNGLinkAddress );
		}

		function updateFileName( options )
		{
			file_name = default_file_name + '-' + objToString( options ) + '.png';
		}

		function updatePNGLinkAddress( data_url )
		{
			png_link.href = data_url;
			png_link.setAttribute( 'download', file_name );
			png_link.classList.add( 'is-active' );
		}

		function hidePNGLink()
		{
			png_link.classList.remove( 'is-active' );
		}

		function objToString( obj )
		{
			var result = [ ];

			for ( var key in obj )
			{
				result.push( key + '' + obj[key] );
			}

			return result.join( '-' );
		}

		return { init: init };
	}
);