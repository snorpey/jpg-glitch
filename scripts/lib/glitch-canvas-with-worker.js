//! glitch-canvas by snorpey, MIT License
(function(window, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        window.glitch = factory();
    }
})(this, function() {

	function Glitcher ( webworkerPath ) {
		if ( ! ( this instanceof Glitcher ) ) {
			return new Glitcher( webworkerPath );
		}

		var self = this
		var canvas1El = document.createElement( 'canvas' );
		var canvas2El = document.createElement( 'canvas' );
		var ctx1 = canvas1El.getContext( '2d' );
		var ctx2 = canvas2El.getContext( '2d' );
		var img = new Image();
		var base64;
		var img;
		var newImageData;
		var i;
		var len;
		var params;
		var worker;
		var base64Chars;
		var base64Map;
		var reversedBase64Map;
		var byteArrayImageData;
		var jpgHeaderLength;

		function init () {
			if ( webworkerPath && 'Worker' in window ) {
				worker = new Worker( webworkerPath );
				worker.addEventListener( 'message', workerResponded, false );
			} else {
				base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
				base64Map = base64Chars.split( '' );
				reversedBase64Map = { };
				
				base64Map.forEach( function ( val, key ) {
					reversedBase64Map[val] = key;
				} );
			}

			return self;
		}

		function glitch ( imageData, parameters, callback ) {
			if (
				isValidImageData( imageData ) &&
				isType( parameters, 'parameters', 'object' ) &&
				isType( callback, 'callback', 'function' )
			) {
				resizeCanvas( canvas1El, imageData );
				resizeCanvas( canvas2El, imageData );
				params = getNormalizedParameters( parameters );
				base64 = getBase64FromImageData( imageData, params.quality );
							
				img.onload = function () {
					ctx1.drawImage( img, 0, 0 );
					newImageData = ctx1.getImageData( 0, 0, imageData.width, imageData.height );
					callback ( newImageData );
					img.onload = null;
				};

				if ( worker ) {
					worker.postMessage( { glitch: { base64: base64, parameters: params } } );
				} else {
					byteArrayImageData = base64ToByteArray( base64 );
					jpgHeaderLength = getJpegHeaderSize( byteArrayImageData );
					
					for ( i = 0, len = params.iterations; i < len; i++ ) {
						glitchJpegBytes( byteArrayImageData, jpgHeaderLength, params.seed, params.amount, i, params.iterations );
					}

					img.src = byteArrayToBase64( byteArrayImageData );
				}
			}

			return self;
		}

		function workerResponded ( event ) {
			if ( event && event.data && event.data.glitched ) {
				glitched( event.data.glitched );
			} else {
				window.console && console.log( 'glitchworker response', event.data );
			}
		}

		function workerFailed ( err ) {
			window.console && console.log( err.message || err );
		}

		function glitched ( newBase64ImageData ) {
			img.src = newBase64ImageData;
		}

		function resizeCanvas ( canvas, size ) {
			if ( canvas.width !== size.width ) {
				canvas.width = size.width;
			}

			if ( canvas.height !== size.height ) {
				canvas.height = size.height;
			}
		}

		function getNormalizedParameters ( parameters ) {
			return {
				seed: ( parameters.seed || 0 ) / 100,
				quality: ( parameters.quality || 0 ) / 100,
				amount: ( parameters.amount || 0 ) / 100,
				iterations: parameters.iterations || 0
			};
		}

		function getBase64FromImageData ( imageData, quality ) {
			var q = typeof quality === 'number' && quality < 1 && quality > 0 ? quality : .1;
			
			ctx2.putImageData( imageData, 0, 0 );
			
			var base64 = canvas2El.toDataURL( 'image/jpeg', q );
			
			switch ( base64.length % 4 ) {
				case 3:
					base64 += '=';
					break;

				case 2:
					base64 += '==';
					break;

				case 1:
					base64 += '===';
					break;
			}

			return base64;
		}

		function isValidImageData ( imageData ) {
			if (
				isType( imageData, 'imageData', 'object' ) &&
				isType( imageData.width, 'imageData.width', 'number' ) &&
				isType( imageData.height, 'imageData.height', 'number' ) &&
				isType( imageData.data, 'imageData.data', 'object' ) &&
				isType( imageData.data.length, 'imageData.data.length', 'number' ) &&
				checkNumber( imageData.data.length, 'imageData.data.length', isPositive, '> 0' )
			) {
				return true;
			} else {
				return false;
			}
		}

		function isType ( it, name, expectedType ) {
			if ( typeof it === expectedType ) {
				return true;
			} else {
				error( it, 'typeof ' + name, '"' + expectedType + '"', '"' + typeof it + '"' );
				return false;
			}
		}

		function checkNumber ( it, name, condition, conditionName ) {
			if ( condition( it ) === true) {
				return true;
			} else {
				error( it, name, conditionName, 'not' );
			}
		}

		function isPositive ( nr ) {
			return nr > 0;
		}

		function error ( it, name, expected, result ) {
			throw new Error( 'glitch(): Expected ' + name + ' to be ' + expected + ', but it was ' + result + '.' );
		}
		
		// all functions beyond this point are only used if no webworker is available

		function glitchJpegBytes ( byteArray, jpgHeaderLength, seed, amount, i, len ) {
			var maxIndex = byteArray.length - jpgHeaderLength - 4;
			var pxMin = parseInt( maxIndex / len * i, 10 );
			var pxMax = parseInt( maxIndex / len * ( i + 1 ), 10 );
			var delta = pxMax - pxMin;
			var pxIndex = parseInt( pxMin + delta * seed, 10 );
			
			if ( pxIndex > maxIndex ) {
				pxIndex = maxIndex;
			}

			var index = Math.floor( jpgHeaderLength + pxIndex );
			
			byteArray[index] = Math.floor( amount * 256 );
		}

		function base64ToByteArray ( str ) {
			var result = [ ];
			var digitNum;
			var cur;
			var prev;
			
			for ( i = 23, len = str.length; i < len; i++ ) {
				cur = reversedBase64Map[str.charAt( i )];
				digitNum = ( i - 23 ) % 4;
				
				switch ( digitNum ) {
					case 1:
						result.push( prev << 2 | cur >> 4 );
						break;

					case 2:
						result.push( ( prev & 15 ) << 4 | cur >> 2 );
						break;

					case 3:
						result.push( ( prev & 3 ) << 6 | cur );
						break;
				}

				prev = cur;
			}

			return result;
		}

		function byteArrayToBase64 ( arr ) {
			var result = [ 'data:image/jpeg;base64,' ];
			var byteNum;
			var cur;
			var prev;
			
			for ( i = 0, len = arr.length; i < len; i++ ) {
				cur = arr[i];
				byteNum = i % 3;
				
				switch (byteNum) {
					case 0:
						result.push( base64Map[cur >> 2] );
						break;

					case 1:
						result.push( base64Map[( prev & 3 ) << 4 | cur >> 4] );
						break;

					case 2:
						result.push( base64Map[( prev & 15 ) << 2 | cur >> 6] );
						result.push( base64Map[cur & 63] );
						break;
				}

				prev = cur;
			}

			if ( byteNum === 0 ) {
				result.push( base64Map[( prev & 3 ) << 4] );
				result.push( '==' );
			} else if ( byteNum === 1 ) {
				result.push( base64Map[( prev & 15 ) << 2] );
				result.push( '=' );
			}

			return result.join( '' );
		}

		function getJpegHeaderSize ( data ) {
			var result = 417;

			for ( i = 0, len = data.length; i < len; i++ ) {
				if ( data[i] === 255 && data[i + 1] === 218 ) {
					result = i + 2;
					break;
				}
			}

			return result;
		}

		self.glitch = glitch;
		self.init = init;
	}

	return Glitcher;
});