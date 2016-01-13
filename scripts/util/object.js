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

		function isEqual ( obj1, obj2 ) {
			return JSON.stringify( obj1 ) === JSON.stringify( obj2 );
		}

		// http://stackoverflow.com/a/383245/229189
		// add missing properties from obj2
		function merge ( obj1, obj2 ) {
			obj1 = getCopy( obj1 );
			obj2 = getCopy( obj2 );

			for ( var p in obj2 ) {
				try {
					// Property in destination object set; update its value.
					if ( typeof obj2[p] === 'object' ) {
						obj1[p] = merge( obj1[p], obj2[p] );
					} else {
						if ( typeof obj1[p] === 'undefined' && typeof obj2[p] !== 'undefined' ) {
							obj1[p] = obj2[p];
						}
					}
				} catch ( e ) {
					obj1[p] = obj2[p];
				}
			}

			return obj1;
		}

		return {
			getObjectByString: getObjectByString,
			getCopy: getCopy,
			merge: merge,
			isEqual: isEqual
		};
	}
);