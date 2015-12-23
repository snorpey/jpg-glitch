/*global define*/
define(
	[ 'util/el', 'util/dom', 'views/dialog', 'util/addpublishers', 'util/math', 'util/localizetext' ],
	function ( elHelper, domHelper, Dialog, addPublishers, mathHelpers, loc ) {
		function NavView ( parentEl ) {
			if ( ! ( this instanceof NavView ) ) {
				return new NavView( parentEl );
			}

			var isActive = false;
			var self = this;
			var el = elHelper.createEl( 'nav', 'nav color-bg', parentEl );
			var publishers = addPublishers( self, 'togglestart', 'toggleend' );

			var buttonTextEl = elHelper.createEl( 'span', 'nav-toggle-button-text' )
			loc( buttonTextEl, 'textContent', 'nav.menu' );
			loc( buttonTextEl, 'title', 'nav.menutitle' );

			var buttonSVGWrapperEl = document.createElement( 'div' );
			buttonSVGWrapperEl.classList.add( 'svg-wrapper' );

			var svgEl = document.getElementById( 'svg' );
			svgEl.setAttribute( 'viewBox', '0 0 24 24' );

			buttonSVGWrapperEl.appendChild( svgEl );

			var svgGroupEl = document.createElementNS( 'http://www.w3.org/2000/svg', 'g' );
			svgGroupEl.setAttribute( 'id', 'menu' );
			svgGroupEl.setAttributeNS( null, 'fill', '#000' );
			svgEl.appendChild( svgGroupEl );

			var svgRect1El = elHelper.createEl( 'rect', null, svgGroupEl );
			svgRect1El.setAttribute( 'id', 'rect-1' );
			svgRect1El.setAttributeNS( null, 'x', '3' );
			svgRect1El.setAttributeNS( null, 'y', '6' );
			svgRect1El.setAttributeNS( null, 'width', '18' );
			svgRect1El.setAttributeNS( null, 'height', '2' );

			var svgRect2El = elHelper.createEl( 'rect', null, svgGroupEl );
			svgRect2El.setAttributeNS( null, 'id', 'rect-2' );
			svgRect2El.setAttributeNS( null, 'x', '3' );
			svgRect2El.setAttributeNS( null, 'y', '11' );
			svgRect2El.setAttributeNS( null, 'width', '18' );
			svgRect2El.setAttributeNS( null, 'height', '2' );

			var svgRect3El = elHelper.createEl( 'rect', null, svgGroupEl );
			svgRect3El.setAttributeNS( null, 'id', 'rect-3' );
			svgRect3El.setAttributeNS( null, 'x', '3' );
			svgRect3El.setAttributeNS( null, 'y', '16' );
			svgRect3El.setAttributeNS( null, 'width', '18' );
			svgRect3El.setAttributeNS( null, 'height', '2' );
			
			buttonSVGWrapperEl.appendChild( svgEl );

			var buttonEl = elHelper.createButton( buttonTextEl, 'nav.menutitle', 'nav-toggle-button', parentEl );
			buttonEl.appendChild( buttonSVGWrapperEl );
			buttonEl.addEventListener( 'click', toggle, false );

			var headlineEl = elHelper.createEl( 'h1', 'nav-headline', el );
			headlineEl.textContent = document.title;

			var navBreakPoint = 600;
			var navWidth = 300;
			var navTouchPadding = 60;
			var isSwiping = false;
			var touchStartPos = { x: 0, y: 0 };
			var touchPos = { x: 0, y: 0 };
			var touchId = 0;
			var translateX = -navWidth;
			var i = 0, len = 0;
			var touch;

			parentEl.addEventListener( 'touchstart', touchStarted );

			function toggle () {
				if ( ! isActive ) {
					activate()
				} else {
					deactivate()
				}
			}

			function activate () {
				isActive = true;
				
				requestAnimationFrame( function () {
					el.classList.add( 'is-active' );
					buttonEl.classList.add( 'is-active' );
				} );

				publishers.togglestart.dispatch( true );
				
				setTimeout( function () {
					publishers.toggleend.dispatch( true );
				}, 300 );
			}

			function deactivate () {
				isActive = false;
				Dialog.closeAll();

				requestAnimationFrame( function () {
					el.classList.remove( 'is-active' );
					buttonEl.classList.remove( 'is-active' );
				} );
				
				publishers.togglestart.dispatch( false );
				
				setTimeout( function () {
					publishers.toggleend.dispatch( false );
				}, 300 );
			}

			function closeSmallScreenNav () {
				if ( window.innerWidth <= navBreakPoint ) {
					deactivate();
				}
			}

			function swipeStarted ( x, y, identifier ) {
				if ( ! isSwiping ) {
					parentEl.addEventListener( 'touchmove', touchMoved );
					parentEl.addEventListener( 'touchend', touchEnded );

					isSwiping = true;
					touchIdentifier = identifier;
					touchStartPos.x = x;
					touchStartPos.y = y;
					touchPos.x = x;
					touchPos.y = y;

					requestAnimationFrame( function () {
						el.classList.add( 'is-swiping' );
						buttonEl.classList.add( 'is-swiping' );
					} );
				}
			}

			function swipeStopped () {
				if ( isSwiping ) {
					parentEl.removeEventListener( 'touchmove', touchMoved );
					parentEl.addEventListener( 'touchend', touchEnded );
					isSwiping = false;

					requestAnimationFrame( function () {
						el.classList.remove( 'is-swiping' );
						buttonEl.classList.remove( 'is-swiping' );

						// remove inline style, so that item can move to
						// transform values from css file
						domHelper.setTransform( el, '' );
						domHelper.setTransform( buttonEl, '' );
						domHelper.setTransform( svgRect1El, '' );
						domHelper.setTransform( svgRect2El, '' );
						domHelper.setTransform( svgRect3El, '' );
						domHelper.setTransform( svgGroupEl, '' );
						svgGroupEl.style.fill = '';
						buttonTextEl.style.width = '';
						buttonTextEl.style.opacity = '';
					} );
					
					var dx = touchPos.x - touchStartPos.x;

					if ( translateX > -navWidth && translateX < 0 && Math.abs( dx ) > 0 ) {
						if ( translateX < -navWidth / 2 ) {
							deactivate();
						} else {
							activate();
						}
					}
				}
			}

			function swiped ( x, y, identifier ) {
				touchPos.x = x;
				touchPos.y = y;

				var dx = touchPos.x - touchStartPos.x;
				var wasTranslateUpdated = false;

				if ( isActive ) {
					if ( dx < 0 && dx >= -navWidth ) {
						wasTranslateUpdated = true;
						translateX = Math.round( Math.max( dx, -navWidth ) );
					} else {
						swipeStopped();
					}
				} else {
					if ( dx > 0 && dx <= navWidth ) {
						wasTranslateUpdated = true;
						translateX = -navWidth + Math.round( Math.min( dx, navWidth ) );
					} else {
						swipeStopped();
					}
				}

				if ( wasTranslateUpdated ) {
					requestAnimationFrame( function () {
						domHelper.setTransform( el, 'translateX(' + translateX + 'px)' );

						var buttonTransform = 'translateX(' + mathHelpers.mapRange( translateX, -navWidth, 0, 0, 242 ) + 'px)';
						domHelper.setTransform( buttonEl, buttonTransform );
						
						var rect1Transform = [
							'rotateZ(' + mathHelpers.mapRange( translateX, -navWidth, 0, 0, 45 ) + 'deg)',
							'translateY(' + mathHelpers.mapRange( translateX, -navWidth, 0, 0, 5.1 ) + 'px)'
						].join( ' ' );
												
						domHelper.setTransform( svgRect1El, rect1Transform );

						domHelper.setTransform( svgRect2El, 'scaleX(' + mathHelpers.mapRange( translateX, -navWidth, 0, 1, 0 ) + ')' );
						
						var rect3Transform = [
							'rotateZ(' + mathHelpers.mapRange( translateX, -navWidth, 0, 0, -45 ) + 'deg)',
							'translateY(' + mathHelpers.mapRange( translateX, -navWidth, 0, 0, -5.1 ) + 'px)'
						].join( ' ' );

						domHelper.setTransform( svgRect3El, rect3Transform );

						domHelper.setTransform( svgGroupEl, 'rotateZ(' + mathHelpers.mapRange( translateX, -navWidth, 0, 0, -90 ) + 'deg)' ); 
						svgGroupEl.style.fill = 'hsl(0, 0%, ' + mathHelpers.mapRange( translateX, -navWidth, 0, 0, 100 ) + '%)';

						buttonTextEl.style.width = mathHelpers.mapRange( translateX, -navWidth, 0, 50, 0 ) + 'px';
						buttonTextEl.style.opacity = mathHelpers.mapRange( translateX, -navWidth, 0, 1.5, 0, true ).toFixed( 2 );
					} );
				}
			}

			function touchStarted ( event ) {
				if ( window.innerWidth <= navBreakPoint && ! isSwiping ) {					
					for ( i = 0, len = event.touches.length; i < len; i++ ) {
						touch = event.touches[i];

						if (
							( ! isActive && touch.clientX <= navTouchPadding ) ||
							( isActive && touch.clientX <= navTouchPadding + navWidth )
						) {
							swipeStarted( touch.clientX, touch.clientY, touch.identifier );
							break;
						}
					}
				}
			}

			function touchMoved ( event ) {
				if ( event.changedTouches ) {
					var hasTouch = false;

					for ( i = 0, len = event.touches.length; i < len; i++ ) {
						touch = event.touches[i];

						if ( touch.identifier === touchIdentifier ) {
							swiped( touch.clientX, touch.clientY, touch.identifier );
							hasTouch = true;
							break;
						}
					}

					if ( ! hasTouch ) {
						swipeStopped();
					}
				} else {
					swipeStopped();
				}
			}

			function touchEnded ( event ) {
				swipeStopped();
			}

			self.el = el;
			self.closeSmallScreenNav = closeSmallScreenNav;
		}

		return NavView;
	}
)