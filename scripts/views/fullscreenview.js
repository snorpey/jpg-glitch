/*global define*/
define(
	[ 'util/browser', 'util/el' ],
	function ( browser, elHelper ) {
		// the fullscreen button
		// includes a lot of code to account for the different browser implementations
		function FullscreenView ( parentEl ) {
			if ( ! ( this instanceof FullscreenView ) ) {
				return new FullscreenView( parentEl );
			}

			var self = this;
			var isInFullScreen = false;
			var fullscreenButtonEl;
			
			if ( browser.test( 'fullscreen' ) ) {
				fullscreenButtonEl = elHelper.createButton( 'controls.fullscreen', 'controls.fullscreentitle', 'fullscreen-button', parentEl, toggleFullscreen );

				document.addEventListener( 'webkitfullscreenchange', fullscreenChanged, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenChanged, false );
				document.addEventListener( 'fullscreenchange', fullscreenChanged, false );
				document.addEventListener( 'MSFullscreenChange', fullscreenChanged, false );
			}

			function fullscreenChanged ( event ) {
				isInFullScreen = document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
				
				if ( isInFullScreen ) {
					document.documentElement.classList.add( 'is-fullscreen' );
				} else {
					document.documentElement.classList.remove( 'is-fullscreen' );
				}
			}

			function toggleFullscreen () {
				if ( isInFullScreen ) {
					exitFullscreen();
				} else {
					requestFullScreen( document.documentElement );
				}
			}

			function requestFullScreen ( el ) {
				if ( el.requestFullscreen ) {
					el.requestFullscreen();
				} else if ( el.mozRequestFullScreen ) {
					el.mozRequestFullScreen();
				} else if ( el.webkitRequestFullscreen ) {
					el.webkitRequestFullscreen();
				} else if ( el.msRequestFullscreen ) {
					el.msRequestFullscreen();
				}
			}

			function exitFullscreen () {
				if ( document.exitFullscreen ) {
					document.exitFullscreen();
				} else if ( document.mozCancelFullScreen ) {
					document.mozCancelFullScreen();
				} else if ( document.webkitExitFullscreen ) {
					document.webkitExitFullscreen();
				}
			}
		}

		return FullscreenView;
	}
);