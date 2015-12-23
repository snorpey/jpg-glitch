/*global define*/
define(
	[ 'util/object' ],
	function ( objectHelper ) {
		// adds publishers to an object that
		// other objects can subscribe to.
		// only the trigger object can
		// publish new messages
		// eg: trigger = addPublushers( obj1, 'test' );
		// obj1.on( 'test', obj2.doStuff );
		// trigger.test.dispatch( 'YOLO' );
		
		function addPublishers () {
			var publishers = { };
			var allowedKeys = [ ];
			var args = Array.prototype.slice.call( arguments );
			var obj = args.shift();

			if ( obj && args.length ) {
				args.forEach( addKey );
			}

			allowedKeys.forEach( function ( key ) {
				if ( ! obj[key] ) {
					obj[key] = { };
				}

				obj[key].dispatch = function () {
					dispatch.apply( dispatch, [ key ].concat( Array.prototype.slice.call( arguments ) ) );
				};

				if ( ! publishers[key] ) {
					publishers[key] = [ ];
				}

				publishers[key].dispatch = function () {
					dispatch.apply( dispatch, [ key ].concat( Array.prototype.slice.call( arguments ) ) );
				};
			} );

			function addKey ( newItem ) {
				var newKeys = [ ];
				var existingKeys = Object.keys( obj );

				if ( typeof newItem === 'string' ) {
					newKeys = newKeys.concat( newItem.split( ' ' ) );
				}

				if ( Array.isArray( newItem ) ) {
					newKeys = newKeys.concat( newItem );
				}

				newKeys = newKeys.filter( function ( key ) {
					if (
						existingKeys.indexOf( key ) === -1 &&
						allowedKeys.indexOf( key ) === -1
					) {
						return true;
					} else {
						return false;
					}
				} );

				allowedKeys = allowedKeys.concat( newKeys );
			}

			function on ( key, fn ) {
				// on( 'my.sub.ev' ) -> obj.my.sub.on( 'ev' );
				if ( typeof key === 'string' && key.indexOf( '.' ) !== -1 ) {
					var keyArr = key.split( '.' );
					var key = keyArr.pop();
					var subObj = objectHelper.getObjectByString( keyArr.join( '.' ), obj );

					if ( subObj && typeof subObj.on === 'function' ) {
						subObj.on( key, fn );
					}
				} else {
					if ( isKeyAllowed( key ) && typeof fn === 'function' ) {
						publishers[key].push( fn );
					}
				}

				return obj;
			}

			function off ( key, fn ) {
				if (
					typeof key === 'string' &&
					typeof fn === 'function' &&
					publishers[key]
				) {
					for ( var i = publishers[key].length; i >= 0; i-- ) {
						if ( publishers[key][i] === fn ) {
							publishers[key].splice( i, 1 );
						}
					}
				}

				return obj;
			}

			function dispatch ( key ) {
				// http://debuggable.com/posts/turning-javascript-s-arguments-object-into-an-array:4ac50ef8-3bd0-4a2d-8c2e-535ccbdd56cb
				var args = Array.prototype.slice.call( arguments ).slice( 1 );

				if ( Array.isArray( publishers[key] ) ) {
					publishers[key].forEach( function ( fn ) {
						fn.apply( fn, args );
					} );
				}

				return obj;
			}

			function isKeyAllowed ( key ) {
				return allowedKeys ? allowedKeys.indexOf( key ) > -1 : true;
			}

			publishers.dispatch = dispatch;
			obj.on = on;
			obj.off = off;

			return publishers;
		}

		return addPublishers;
	}
);