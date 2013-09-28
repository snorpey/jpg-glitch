/*global define*/
define(
	function()
	{
		var signals;
		var reader;
		var feature;
		var allowed_file_types = [ 'image/png', 'image/jpg', 'image/jpeg' ];
		var re_encode = false;
		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );
		var tmp_img = new Image();

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
				re_encode = false;

				// beware of ugly hack:
				// jpg images can be progressive, in which case we need to
				// convert them to to png to remove the progressive rendering.
				// why? because i haven't figured out how to deal with
				// progressive jpgs in the glitch logic yet
				if ( allowed_file_types.indexOf( file.type ) > 0 )
				{
					re_encode = true;
				}
				
				reader.readAsDataURL( event.dataTransfer.files[0] );
			}
		}

		function fileLoaded( event )
		{
			var file_src = event.target.result;

			if ( re_encode )
			{
				re_encode = false;

				reEncode( file_src, signals['set-new-src'].dispatch );
			}

			else
			{
				signals['set-new-src'].dispatch( file_src );
			}
		}

		function reEncode( file_src, callback )
		{
			tmp_img.onload = function() {
				tmp_canvas.width = tmp_img.naturalWidth;
				tmp_canvas.height = tmp_img.naturalHeight;
				tmp_ctx.drawImage( tmp_img, 0, 0 );
				callback( tmp_canvas.toDataURL( 'image/png' ) );
			};

			tmp_img.src = file_src;
		}

		return { init: init };
	}
);