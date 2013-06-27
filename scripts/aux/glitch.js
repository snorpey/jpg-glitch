/*global define*/
define(
	function()
	{
		var canvas = document.createElement( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		var tmp_canvas = document.createElement( 'canvas' );
		var tmp_ctx = tmp_canvas.getContext( '2d' );

		var canvas_size = { width: 10, height: 10 };

		var base64_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		var base64_map = base64_chars.split( '' );
		var reverse_base64_map = { };

		var iterations;
		var quality;
		var seed;
		var offset;
		var base64;
		var byte_array;
		var jpg_header_length;
		var img;
		var new_image_data;

		var i;
		var len;

		base64_map.forEach( function( val, key ) { reverse_base64_map[val] = key; } );

		function getGlitchedImageSrc( image_data, input, callback )
		{
			seed = input.seed / 100;
			quality = input.quality / 100;
			offset = input.offset / 100;
			iterations = input.iterations;

			updateCanvasSize( image_data.width, image_data.height );

			base64 = getBase64FromImageData( image_data, quality );
			byte_array = base64ToByteArray( base64 );
			jpg_header_length = getJpegHeaderSize( byte_array );

			for ( i = 0; i < iterations; i++ )
			{
				glitchJpegBytes( byte_array, jpg_header_length, seed, offset, i );
			}

			img = new Image();
			img.onload = function() {
				ctx.drawImage( img, 0, 0 );
				new_image_data = ctx.getImageData( 0, 0, image_data.width, image_data.height );
				callback( new_image_data );
			};

			img.src = byteArrayToBase64( byte_array );
		}

		function updateCanvasSize( width, height )
		{
			var updated = false;

			if ( canvas_size.width !== width ) { canvas_size.width = width; updated = true; }
			if ( canvas_size.height !== height ) { canvas_size.height = height; updated = true; }

			if ( updated )
			{
				resizeCanvas( tmp_canvas, canvas_size );
				resizeCanvas( canvas, canvas_size );
			}
		}

		function resizeCanvas( canvas, img )
		{
			canvas.width = img.width;
			canvas.height = img.height;
		}

		function glitchJpegBytes( byte_array, jpg_header_length, seed, offset, iteration )
		{
			var it = ( iteration + 1 ) / 10;
			var max_index = byte_array.length - jpg_header_length - 4;
			var px_index = it * max_index + offset * 10;

			if ( px_index > max_index )
			{
				px_index = px_index;
			}

			var index = Math.floor( jpg_header_length + px_index );
			byte_array[index] = Math.floor( seed * 256 );
		}

		function getBase64FromImageData( image_data, quality )
		{
			var q = typeof quality === 'number' && quality < 1 && quality > 0 ? quality : 0.1;
			tmp_ctx.putImageData( image_data, 0, 0 );
			return tmp_canvas.toDataURL( 'image/jpeg', q );
		}

		function getJpegHeaderSize( data )
		{
			var result = 417;

			for ( var i = 0, l = data.length; i < l; i++ )
			{
				if ( data[i] === 0xFF && data[i + 1] === 0xDA )
				{
					result = i + 2;
					break;
				}
			}

			return result;
		}

		// https://github.com/mutaphysis/smackmyglitchupjs/blob/master/glitch.html
		// base64 is 2^6, byte is 2^8, every 4 base64 values create three bytes
		function base64ToByteArray( str )
		{
			var result = [ ];
			var digit_num;
			var cur;
			var prev;

			for ( var i = 23, l = str.length; i < l; i++ )
			{
				cur = reverse_base64_map[ str.charAt( i ) ];
				digit_num = ( i - 23 ) % 4;

				switch ( digit_num )
				{
					// case 0: first digit - do nothing, not enough info to work with
					case 1: // second digit
						result.push( prev << 2 | cur >> 4 );
						break;
					case 2: // third digit
						result.push( ( prev & 0x0f ) << 4 | cur >> 2 );
						break;
					case 3: // fourth digit
						result.push( ( prev & 3 ) << 6 | cur );
						break;
				}

				prev = cur;
			}

			return result;
		}

		function byteArrayToBase64( arr )
		{
			var result = [ 'data:image/jpeg;base64,' ];
			var byte_num;
			var cur;
			var prev;
			var i;

			for ( var i = 0, l = arr.length; i < l; i++ )
			{
				cur = arr[i];
				byte_num = i % 3;

				switch ( byte_num )
				{
					case 0: // first byte
						result.push( base64_map[ cur >> 2 ] );
						break;
					case 1: // second byte
						result.push( base64_map[( prev & 3 ) << 4 | ( cur >> 4 )] );
						break;
					case 2: // third byte
						result.push( base64_map[( prev & 0x0f ) << 2 | ( cur >> 6 )] );
						result.push( base64_map[cur & 0x3f] );
						break;
				}

				prev = cur;
			}

			if ( byte_num === 0 )
			{
				result.push( base64_map[( prev & 3 ) << 4] );
				result.push( '==' );
			}

			else if ( byte_num === 1 )
			{
				result.push( base64_map[( prev & 0x0f ) << 2] );
				result.push( '=' );
			}

			return result.join( '' );
		}

		function getImageDataCopy( image_data )
		{
			var copy = tmp_ctx.createImageData( image_data.width, image_data.height );
			copy.data.set( image_data.data );
			return copy;
		}

		return getGlitchedImageSrc;
	}
);