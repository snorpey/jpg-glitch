/*global define*/
define(
	function()
	{
		var signals;
		var image;
		var initialized = false;
		
		// max 2k px per side, so 2000 * 2000
		var max_image_area = 4000000;

		function init( shared )
		{
			signals = shared.signals;
			image = new Image();

			signals['set-new-src'].add( setSrc );

			image.addEventListener( 'load', imageLoaded, false );

			// the image "Abraham Lincoln November 1863" is public domain:
			// https://en.wikipedia.org/wiki/File:Abraham_Lincoln_November_1863.jpg
			setSrc( 'lincoln.jpg' );
		}

		function imageLoaded()
		{
			constrainImageSize( image );

			signals['image-loaded'].dispatch( image );
			initialized = true;
		}

		function setSrc( src )
		{
			image.src = src;

			if (
				initialized &&
				image.naturalWidth !== undefined &&
				image.naturalWidth !== 0
			)
			{
				setTimeout( imageLoaded, 10 );
			}
		}
		
		function constrainImageSize( img )
		{
			var ratio = 0;
			var image_width = img.width;
			var image_height = img.height;
			var image_area = image_width * image_height;

			if ( image_area > max_image_area )
			{
				ratio = max_image_area / image_area;
				
				image_width *= ratio;
				image_height *= ratio;

				img.naturalWidth = Math.floor( image_width );
				img.naturalWidth = Math.floor( image_height );
			}
		}

		return { init: init };
	}
);