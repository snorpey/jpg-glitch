/*global define*/
define(
	function () {
		function mapRange ( value, inMin, inMax, outMin, outMax, clampResult ) {
			var result = ( ( value - inMin ) / ( inMax - inMin ) * ( outMax - outMin ) + outMin );

			if ( clampResult ) {
				if ( outMin > outMax ) {
					result = Math.min( Math.max( result, outMax ), outMin );
				} else {
					result = Math.min( Math.max( result, outMin ), outMax );
				}
			}

			return result;
		}

		return {
			mapRange: mapRange
		};
	}
);