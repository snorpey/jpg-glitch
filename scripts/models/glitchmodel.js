/*global define*/
define(
	[ 'config', 'lib/glitch-canvas-with-worker', 'util/addpublishers', 'util/canvas' ],
	function ( config, canvasGlitcher, addPublishers, canvasHelper ) {
		// the glitchModel takes care of glitching the image and passing it along as imageData
		function GlitchModel () {
			if ( ! ( this instanceof GlitchModel ) ) {
				return new GlitchModel();
			}

			var self = this;
			var publishers = addPublishers( self, 'glitch' );
			var params = { };
			var originalImageData;
			var glitchedImageData;
			var thumbnailCanvas = document.createElement( 'canvas' );
			var thumbnailImg = new Image();
			var glitchTimeoutId = NaN;

			var glitcher = canvasGlitcher( config.workers.glitch ).init();
			
			function updateGlitch () {
				if ( params && originalImageData ) {
					glitcher.glitch( originalImageData, params, glitchComplete );
				}
			}

			function glitchComplete ( glitchData ) {
				glitchedImageData = glitchData;
				publishers.glitch.dispatch( glitchData );
			}

			function setValue ( key, newValue ) {
				if ( params[key] !== newValue ) {
					params[key] = newValue;
					glitchTimeoutId = setTimeout( updateGlitch, 10 );
				}
			}

			function setImageData ( newImageData ) {
				originalImageData = newImageData;
				updateGlitch()
			}

			function generateImageURL ( callback, size, args ) {
				if ( originalImageData ) {
					size = size || { width: 50, height: 50 };

					if ( typeof size === 'string' && size === 'original' ) {
						size = {
							width: glitchedImageData.width,
							height: glitchedImageData.height
						};
					}

					canvasHelper.resizeImage( glitchedImageData, size, function ( imageUrl ) {
						args = Array.prototype.slice.call( args || [ ] );
						args.unshift( imageUrl );
						
						callback.apply( callback, args );
					}, 'asDataURL' );
				}

				return self;
			}

			function getImageGenerationFn ( callback, size ) {
				return function () {
					generateImageURL( callback, size, arguments )
				};
			}

			self.setValue = setValue;
			self.setImageData = setImageData;
			self.generateImageURL = generateImageURL;
			self.getImageGenerationFn = getImageGenerationFn;
		}

		return GlitchModel;
	}
)