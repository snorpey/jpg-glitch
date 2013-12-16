/*global define*/
define(
	function()
	{
		var signals;
		var export_button;
		var png_link;
		var default_file_name;
		var file_name;
		var download_file_name;
		var file_suffix = '.png';
		var file_suffix_regex = /(\.)(jpg|jpeg|png|gif|bmp)/ig;
		var parameters;

		function init( shared )
		{
			signals = shared.signals;
			export_button = document.getElementById( 'export-button' );
			png_link = document.getElementById( 'png-button' );
			default_file_name = png_link.getAttribute( 'download' ).replace( file_suffix_regex, '' );
			file_name = default_file_name;
			download_file_name = default_file_name;

			export_button.addEventListener( 'click', exportButtonClicked, false );
			png_link.addEventListener( 'click', hidePNGLink, false );

			signals['load-file'].add( updateFileName );
			signals['load-file'].add( updateDownloadFileName );
			signals['control-updated'].add( updateParameters );
			signals['control-updated'].add( updateDownloadFileName );
		}

		function exportButtonClicked( event )
		{
			event.preventDefault();

			signals['image-data-url-requested'].dispatch( updatePNGLinkAddress );
		}

		function updateFileName( file )
		{
			if (
				file &&
				typeof file.name === 'string'
			)
			{
				file_name = file.name.replace( file_suffix_regex, '' );
			}
		}

		function updateParameters( new_parameters )
		{
			parameters = new_parameters || parameters;
		}

		function updateDownloadFileName()
		{
			download_file_name = file_name + '-glitched-' + objToString( parameters ) + file_suffix;
		}

		function updatePNGLinkAddress( data_url )
		{
			png_link.href = data_url;
			png_link.setAttribute( 'download', download_file_name );
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
				result.push( key[0] + '' + obj[key] );
			}

			return result.join( '-' );
		}

		return { init: init };
	}
);