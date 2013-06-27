/*global define*/
define(
	[ 'aux/glitch' ],
	function( glitch )
	{
		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );

		var canvas = document.getElementById( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		var is_processing = false;
		var values;
		var image;
		var signals;
		var image_data;

		function init( shared )
		{
			signals = shared.signals;

			signals['image-loaded'].add( generate );
			signals['control-updated'].add( controlsUpdated );
			signals['saved'].add( exportData );
		}

		function controlsUpdated( new_values )
		{
			values = getAdjustedValues( new_values );

			update();
		}

		function generate( img )
		{
			if ( ! is_processing )
			{
				image = img;
				processImage( image );
			}
		}

		function update()
		{
			if ( ! is_processing && image )
			{
				processImage( image );
			}
		}

		function processImage( img )
		{
			is_processing = true;

			clearCanvas( tmp_canvas, tmp_ctx );
			clearCanvas( canvas, ctx );

			resizeCanvas( tmp_canvas, img );
			resizeCanvas( canvas, img );

			tmp_ctx.drawImage( img, 0, 0 );

			image_data = tmp_ctx.getImageData( 0, 0, tmp_canvas.width, tmp_canvas.height );

			glitch( image_data, values, draw );
		}

		function draw( image_data )
		{
			resizeCanvas( canvas, image_data );
			ctx.putImageData( image_data, 0, 0 );

			is_processing = false;
			image_data = null;
		}

		function resizeCanvas( canvas, img )
		{
			canvas.width = img.width;
			canvas.height = img.height;
		}

		function clearCanvas( canvas, ctx )
		{
			ctx.clearRect( ctx, 0, 0, canvas.width, canvas.height );
		}

		function exportData()
		{
			signals['export-png'].dispatch( canvas.toDataURL( 'image/png' ) );
		}

		function getAdjustedValues( new_values )
		{
			var result = { };

			for ( var key in new_values )
			{
				result[key] = parseInt( new_values[key], 10 );
			}

			key = null;

			return result;
		}

		return { init: init };
	}
);