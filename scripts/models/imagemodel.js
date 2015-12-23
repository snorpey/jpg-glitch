/*global define*/
define(
	[ 'util/browser', 'util/addpublishers', 'util/time', 'util/canvas', 'util/localizetext' ],
	function ( browser, addPublishers , timeHelper, canvasHelper, loc ) {
		// the imageModel loads and stores the latest open image file
		// (the original, not the glitched version) and converts it into
		// a imageData object
		function ImageModel () {
			if ( ! ( this instanceof ImageModel ) ) {
				return new ImageModel();
			}

			var self = this;
			var publishers = addPublishers( self, [ 'load', 'update', 'error', 'statusmessage' ] );
			
			var canvasEl = document.createElement( 'canvas' );
			var ctx = canvasEl.getContext( '2d' );
			var imageEl = new Image();

			var fileReader;
			var canHandleFileImport = false;
			var lastImageSrc;
			var lastFileName;

			// max image import filesize in megabytes.
			// because of not 100% clear base64 url size constraints
			// if the uploaded image is bigger, resize
			// var maxFileSize = Math.pow(1024, 2) * 1.5;
			var maxFileSize = 0.8 * Math.pow( 1000, 2 );
			var isScalingDown = true;

			if ( fileReader = browser.getFeature( window, 'FileReader' ) ) {
				fileReader = new fileReader();
				canHandleFileImport = true;
				fileReader.addEventListener( 'load', fileLoaded );
				fileReader.addEventListener( 'error', fileLoadFailed );
			}

			imageEl.addEventListener( 'load', imageLoaded );
			imageEl.addEventListener( 'error', imageLoadFailed );

			function loadFromFile ( file ) {
				if ( canHandleFileImport ) {
					lastFileName = file.name;
					fileReader.readAsDataURL( file );
				}

				return self;
			}

			function loadFromVideo ( videoEl ) {
				clearCanvas();
				canvasEl.width = videoEl.width || videoEl.videoWidth || videoEl.clientWidth;
				canvasEl.height = videoEl.height || videoEl.videoHeight || videoEl.clientHeight;

				ctx.translate( canvasEl.width, 0 );
				ctx.scale( -1, 1 );
				ctx.drawImage( videoEl, 0, 0 );

				lastImageSrc = canvasEl.toDataURL( 'image/png' );
				lastFileName = loc( 'webcam.picture', timeHelper.dateTimeToLocalStr( new Date() ) );
												
				checkImageData( ctx.getImageData( 0, 0, canvasEl.width, canvasEl.height ), publishers.load.dispatch );
				
				return self;
			}

			function loadFromURL ( url, fileName ) {
				if ( fileName ) {
					lastFileName = fileName;
				}

				url = decodeURIComponent( url );

				publishers.update.dispatch( 'img', url, fileName );
				
				if ( url && imageEl.src !== url ) {
					imageEl.src = '';
					lastImageSrc = url;
					imageEl.src = url;
				} else {
					imageLoaded();
				}

				return self;
			}

			function clearCanvas () {
				ctx.clearRect( 0, 0, canvasEl.width, canvasEl.height );
			}

			function imageLoaded () {
				var imageData = getImageData( imageEl );

				checkImageData( imageData, publishers.load.dispatch );
			}

			function imageLoadFailed ( err ) {
				publishers.error.dispatch( 'file.error.openimage', imageEl.src );
			}

			function fileLoaded ( event ) {
				loadFromURL( event.target.result );
			}

			function fileLoadFailed ( error ) {
				publishers.error.dispatch( 'file.error.openfile' );
			}

			function checkImageData ( imageData, callback ) {
				if ( isScalingDown && imageData.data && imageData.data.length / 4 > maxFileSize ) {
					var widthToHeightRatio = imageData.width / imageData.height;
					var heightTiWidthRatio = imageData.height / imageData.width;

					var newWidth = Math.round( Math.sqrt( maxFileSize / widthToHeightRatio ) );
					var newHeight = Math.round( newWidth * heightTiWidthRatio );
					var newSize = {
						width: newWidth,
						height: newHeight
					};

					publishers.statusmessage.dispatch( 'file.message.resize' );
					
					canvasHelper.resizeImage( imageData, newSize, function ( result ) {
						callback( result.imageData );

						if ( typeof result.dataURL === 'string' ) {
							lastImageSrc = result.dataURL;
						}
					}, 'both' );
				} else {
					callback( imageData );
				}
			}

			function settingUpdated ( key, value ) {
				if ( key === 'resizeUploadedImages' && typeof value === 'boolean' ) {
					isScalingDown = value;
				}
			}

			function getImageData ( img ) {
				clearCanvas();
				canvasEl.width = img.naturalWidth;
				canvasEl.height = img.naturalHeight;
				ctx.drawImage( img, 0, 0, img.naturalWidth, img.naturalHeight );

				return ctx.getImageData( 0, 0, img.naturalWidth, img.naturalHeight );
			}

			function getLastImageSRC ( img ) {
				return lastImageSrc;
			}

			function getLastFileName ( img ) {
				return lastFileName;
			}

			self.loadFromFile = loadFromFile;
			self.loadFromVideo = loadFromVideo;
			self.getLastImageSRC = getLastImageSRC;
			self.getLastFileName = getLastFileName;
			self.loadFromURL = loadFromURL;
			self.settingUpdated = settingUpdated;
		}

		return ImageModel;
	}
);