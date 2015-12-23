/*global define*/
define(
	[ 'util/string' ],
	function ( strUtil ) {

		var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];
		var results = { };

		var tests = {
			getusermedia: function () {
				return navigator.getUserMedia = (
					navigator.getUserMedia ||
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia
				);
			},
			fullscreen: function () {
				return !! (
					getFeature( document, 'fullScreenEnabled' ) ||
					getFeature( document, 'fullscreenEnabled' )
				);
			},
			browserdb: function() {
				return (
					getFeature( window, 'indexedDB' ) ||
					getFeature( window, 'openDatabase' )
				);
			},
			browserstorage: function() {
				return (
					test( 'browserdb' ) ||
					getFeature( window, 'localStorage' )
				);
			},
			draganddrop: function () { return 'draggable' in document.createElement( 'span' ); },
			touch: function () { return !!( 'ontouchstart' in window ); },
			webworker: function () { return !! ( 'Worker' in window ); },
			promise: function () { return !! ( 'Promise' in window ); },
			localforage: function () { 
				return ( test( 'promise' ) && test( 'browserstorage' ) );
			},
			safari: function () { return /^((?!chrome|android).)*safari/i.test( navigator.userAgent ); }
		};

		function test ( featureName ) {
			if ( typeof results[featureName] !== 'undefined' ) {
				return results[featureName];
			} else {
				results[featureName] = tests[featureName] ? tests[featureName]() : false;
				return results[featureName];
			}
		}

		function getFeature ( obj, propertyName ) {
			var result = testProperty( obj, propertyName );

			if ( ! result ) {
				for ( var i = 0, len = prefixes.length; i < len; i++ ) {
					if ( ! result ) {
						result = testProperty( obj, strUtil.toCamelCase( prefixes[i] + '-' + propertyName ) );
					} else {
						break;
					}
				}
			}

			return result;
		}

		function testProperty ( obj, propertyName ) {
			return obj[propertyName];
		}

		return {
			getFeature: getFeature,
			test: test
		};
	}
);