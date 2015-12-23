/*global define*/
define(
	function () {
		function setTransform ( el, transformStr ) {
			el.style.transform = el.style.webkitTransform = el.style.msTransform = transformStr;
		}
		
		// http://stackoverflow.com/a/2234986/229189
		function isDescendant ( parent, child ) {
			var node = child.parentNode;
			
			while ( node != null ) {
				if ( node == parent ) {
					return true;
				}
				
				node = node.parentNode;
			}
			
			return false;
		}

		// http://stackoverflow.com/a/384380/229189    
		function isElement ( obj ) {
			return (
		    	typeof HTMLElement === 'object' ? obj instanceof HTMLElement :
				obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string'
			);
		}

		return {
			setTransform: setTransform,
			isDescendant: isDescendant,
			isElement: isElement
		};
	}
);