self.addEventListener( 'message', receivedMessageEvent, false );

function receivedMessageEvent ( event ) {
	if (
		event &&
		event.data &&
		event.data.glitch &&
		event.data.glitch.base64 &&
		event.data.glitch.parameters
	) {
		self.postMessage( { glitched: getGlitchedImageData( event.data.glitch.base64, event.data.glitch.parameters ) } );
	} else {
		self.postMessage( event.data );
	}
}

var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var base64Map = base64Chars.split( '' );
var reversedBase64Map = { };
var base64ImageData;
var byteArrayImageData;
var jpgHeaderLength = 0;
var params;

var i = 0;
var len = 0;

base64Map.forEach( function ( val, key ) {
	reversedBase64Map[val] = key;
} );

function getGlitchedImageData ( base64ImageData, parameters ) {
	params = parameters;
	byteArrayImageData = base64ToByteArray( base64ImageData );
	jpgHeaderLength = getJpegHeaderSize( byteArrayImageData );
	
	for ( i = 0, len = params.iterations; i < len; i++ ) {
		glitchJpegBytes( byteArrayImageData, jpgHeaderLength, params.seed, params.amount, i, params.iterations );
	}
	
	return byteArrayToBase64( byteArrayImageData );
}

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