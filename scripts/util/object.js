/*global define*/
define(
	function () {
		// http://stackoverflow.com/a/6491621/229189
		function getObjectByString ( str, obj ) {
			if ( typeof str === 'string' ) {
				str = str.replace( /\[(\w+)\]/g, '.$1' ); // convert indexes to properties
				str = str.replace( /^\./, '' );           // strip a leading dot

				var keys = str.split( '.' );

				for ( var i = 0, len = keys.length; i < len; ++i ) {
					var key = keys[i];
					
					if ( key in obj ) {
						obj = obj[key];
					} else {
						return;
					}
				}
			}

			return obj;
		}

		function getCopy ( obj ) {
			return JSON.parse( JSON.stringify( obj ) );
		}

		return {
			getObjectByString: getObjectByString,
			getCopy: getCopy
		};
	}
);