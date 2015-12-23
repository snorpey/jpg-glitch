/*global define*/
define(
	function () {
		var canvas = document.createElement( 'canvas' );
		var ctx = canvas.getContext( '2d' );

		function resizeImage ( content, size, callback, returnType ) {
			var image = new Image();
			var scale = 1;
			var isImageData = false;
			var isString = false;

			image.addEventListener( 'load', imageLoaded );

			// url
			if ( typeof content === 'string' ) {
				isString = true;
				image.src = content;
			}

			// imagedata
			if ( content.width && content.height && content.data && content.data.length ) {
				isImageData = true;
				canvas.width = content.width;
				canvas.height = content.height;

				scale = Math.min(
					size.width / content.width,
					size.height / content.height
				);

				ctx.putImageData( content, 0, 0 );
				image.src = canvas.toDataURL( 'image/png', 1 );
			}

			if ( ! isString && ! isImageData ) {
				callback( false );
			}

			function imageLoaded () {
				if ( isString && image.src === content ) {
					// src loaded
					canvas.width = image.naturalWidth;
					canvas.height = image.naturalHeight;
						
					scale = Math.min(
						size.width / image.naturalWidth,
						size.height / image.naturalHeight
					);

					ctx.drawImage( image, 0, 0 );
					image.src = canvas.toDataURL( 'image/png', 1 );
				} else {
					// imageData loaded
					canvas.width = size.width;
					canvas.height = size.height;

					ctx.scale( scale, scale );
					ctx.drawImage( image, 0, 0 );

					if ( returnType === 'both' ) {
						callback( {
							dataURL: canvas.toDataURL( 'image/png', 1 ),
							imageData: ctx.getImageData( 0, 0, canvas.width, canvas.height )
						} );
					} else {
						if ( isString || returnType === 'asDataURL' ) {
							callback( canvas.toDataURL( 'image/png', 1 ) );
						} else {
							if ( isImageData || returnType === 'asImageData' ) {
								callback( ctx.getImageData( 0, 0, canvas.width, canvas.height ) );
							} else {
								callback();
							}
						}
					}
				}
			}
		}

		return {
			resizeImage: resizeImage
		};
	}
);