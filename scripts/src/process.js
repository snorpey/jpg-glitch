/*global define, requestAnimationFrame*/
define(
	[ 'lib/glitch-canvas', 'util/canvas', 'lib/raf' ],
	function( glitch, canvas_helper )
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
		var canvas_size;

		function init( shared )
		{
			signals = shared.signals;

			signals['image-loaded'].add( generate );
			signals['control-updated'].add( controlsUpdated );
			signals['image-data-url-requested'].add( exportData );
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
				resetCanvas( image );
				updateImageData( image );
				processImage( image );
			}
		}

		function requestTick()
		{
			if ( ! is_processing )
			{
				requestAnimationFrame( update );
			}

			is_processing = true;
		}

		function update()
		{
			if ( image )
			{
				processImage( image );
			}

			else
			{
				is_processing = false;
			}
		}

		function updateImageData( img )
		{
			tmp_ctx.drawImage( img, 0, 0 );

			image_data = tmp_ctx.getImageData( 0, 0, tmp_canvas.width, tmp_canvas.height );
		}

		function resetCanvas( img )
		{
			canvas_helper.clear( tmp_canvas, tmp_ctx );
			canvas_helper.resize( tmp_canvas, img );
			canvas_helper.clear( canvas, ctx );
			canvas_helper.resize( canvas, img );
		}

		function processImage( img )
		{
			is_processing = true;

			glitch( image_data, values, draw );
		}

		function draw( glitched_image_data )
		{
			ctx.putImageData( glitched_image_data, 0, 0 );

			is_processing = false;
			glitched_image_data = null;
		}

		function exportData( callback )
		{
			if ( typeof callback === 'function' )
			{
				callback( canvas.toDataURL( 'image/png' ) );
			}
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