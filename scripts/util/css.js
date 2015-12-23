/*global define*/
define(
	function () {
		function getCSSMatrix ( el ) {
			var style = window.getComputedStyle( el );

			return style.getPropertyValue( '-webkit-transform' ) ||
				   style.getPropertyValue( '-moz-transform' ) ||
				   style.getPropertyValue( '-ms-transform' ) ||
				   style.getPropertyValue( '-o-transform' ) ||
				   style.getPropertyValue( 'transform' );
		}

		function cssMatrixToTransformObj ( matrix ) {
			// this happens when there was no rotation yet in CSS
			if ( matrix === 'none' ) {
				matrix = 'matrix(0,0,0,0,0)';
			}
			
			var obj = { };
			var values = matrix.match( /([-+]?[\d\.]+)/g );

			obj.rotate = ( Math.round(
				Math.atan2(
					parseFloat( values[1] ), 
					parseFloat( values[0] ) ) * ( 180 / Math.PI )
				) || 0
			).toString() + 'deg';
			
			obj.translateStr = values[5] ? values[4] + 'px, ' + values[5] + 'px' : ( values[4] ? values[4] + 'px' : '' );
			
			obj.translateX = parseFloat( values[4] );
			obj.translateY = values[5] ? parseFloat( values[5] ) : 0;	
			
			return obj;
		}

		return {
			getCSSMatrix: getCSSMatrix,
			cssMatrixToTransformObj: cssMatrixToTransformObj
		}
	}
);