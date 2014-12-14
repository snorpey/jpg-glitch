/*global define*/
define(
	function()
	{
		var signals;
		var image;
		var initialized = false;
		var defaultimage = document.body.getAttribute( 'data-defaultimage' );

		function init( shared )
		{
			signals = shared.signals;
			image = new Image();

			signals['set-new-src'].add( setSrc );

			image.addEventListener( 'load', imageLoaded, false );

			// the image "Abraham Lincoln November 1863" is public domain:
			// https://en.wikipedia.org/wiki/File:Abraham_Lincoln_November_1863.jpg
			setSrc( defaultimage );
		}

		function imageLoaded()
		{
			signals['image-loaded'].dispatch( image );

			if ( initialized ) {
				signals['close-intro'].dispatch();
			}

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

		return { init: init };
	}
);