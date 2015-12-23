/*global define*/
// most of this was shamelessly taken from @jakearchibald's svgomg ui:
// https://github.com/jakearchibald/svgomg/blob/master/src/js/page/ui/pan-zoom.js
define(
	[ 'util/css', 'util/dom', 'util/addpublishers' ],
	function ( cssHelper, domHelper, addPublishers ) {
		function getXY ( obj ) {
			return {
				x: obj.pageX,
				y: obj.pageY
			};
		}

		function touchDistance ( touch1, touch2 ) {
			var x = Math.abs( touch2.x - touch1.x );
			var y = Math.abs( touch2.y - touch1.y );
			return Math.sqrt( x * x + y * y );
		}

		function getMidpoint ( point1, point2 ) {
			return {
				x: ( point1.x + point2.x ) / 2,
				y: ( point1.y + point2.y ) / 2
			};
		}

		function getPoints ( event ) {
			if ( event.touches ) {
				return Array.prototype.map.call( event.touches, getXY );
			} else {
				return [ getXY( event ) ];
			}
		}

		function PanZoom ( containerEl, targetEl, opts ) {
			if ( ! ( this instanceof PanZoom ) ) {
				return new PanZoom ( targetEl, containerEl, opts );
			}

			var self = this;
			var canZoomWithPonter = true;
			var publishers = addPublishers( self, 'scale' );
			opts = opts || { }

			var shouldCaptureFn = opts.shouldCaptureFn || function ( el ) { return true; };
			var limitToContainer = typeof opts.limitToContainer === 'boolean' ? opts.limitToContainer : true;
			var limitPadding = opts.limitPadding || 50;

			var matrix = cssHelper.getCSSMatrix( targetEl );
			var transform = cssHelper.cssMatrixToTransformObj( matrix );

			var x = transform.translateX || 0;
			var y = transform.translateY || 0;
			var scale = 1;
			var active = 0;
			var lastPoints = [ ];
			var containerBounds;
			var updateAnimationFrameId = NaN;
			var scaleAnimationFrameId = NaN;
			var centerAnimationFrameId = NaN;
			var resizeTimeoutId = NaN;
			var targetElSize = { width: 100, height: 100 };
			var containerElSize = { width: 100, height: 100 };
			var centerScale = 1;
			
			containerEl.addEventListener( 'mousedown', pointerPressed );
			containerEl.addEventListener( 'touchstart', pointerPressed );
			containerEl.addEventListener( 'wheel', wheelTurned );

			window.addEventListener( 'resize', resized );
						
			targetEl.style.WebkitTransformOrigin = targetEl.style.transformOrigin = '0 0';

			updateContainerBounds();

			function reset () {
				// x = transform.translateX || 0;
				// y = transform.translateY || 0;
												
				updateValues ( transform.translateX || 0, transform.translateY || 0, 1 );
			}

			function updateValues ( newX, newY, newScale, targetBounds ) {
				cancelAnimationFrame( updateAnimationFrameId );

				if ( limitToContainer && targetEl !== containerEl && containerBounds ) {
					targetBounds = targetBounds || targetEl.getBoundingClientRect();
										
					if ( newX !== x || newY !== y || newScale !== scale ) {
						var scaleDelta = 1 / ( scale / newScale );
					
						if ( newX + targetBounds.width * scaleDelta < limitPadding ) {
							newX = limitPadding - targetBounds.width * scaleDelta;
						}

						if ( newX > containerBounds.width - limitPadding ) {
							newX = containerBounds.width - limitPadding;
						}
					
						if ( newY + targetBounds.height * scaleDelta < limitPadding ) {
							newY = limitPadding - targetBounds.height * scaleDelta;
						}

						if ( newY > containerBounds.height - limitPadding ) {
							newY = containerBounds.height - limitPadding;
						}
					}
				}

				newScale = Math.min( 5, Math.max( 0.01, newScale ) );
				
				if ( scale === newScale && newScale === 5 ) {
					return;
				}

				x = newX;
				y = newY;
				scale = newScale
				
				publishers.scale.dispatch( scale );

				updateAnimationFrameId = requestAnimationFrame( update );
			}

			function update () {
				targetEl.style.WebkitTransform = targetEl.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')';
			}

			function wheelTurned ( event ) {
				if ( ! shouldCaptureFn( event.target ) ) { return; }
				if ( ! canZoomWithPonter ) { return; }
				event.preventDefault();

				var targetBounds = targetEl.getBoundingClientRect();
				var delta = event.deltaY;

				if ( event.deltaMode === 1 ) { // 1 is "lines", 0 is "pixels"
					// Firefox uses "lines" when mouse is connected
					delta *= 15;
				}

				// stop mouse wheel producing huge values
				delta = Math.max( Math.min( delta, 60 ), -60 );

				var scaleDiff = ( delta / 300 ) + 1;

				// avoid to-small values
				if ( scale * scaleDiff < 0.05 ) { return; }

				updateValues(
					x - ( event.pageX - targetBounds.left ) * ( scaleDiff - 1 ),
					y - ( event.pageY - targetBounds.top ) * ( scaleDiff - 1 ),
					scale * scaleDiff,
					targetBounds
				);
			}
	
			function firstPointerPressed ( event ) {
				document.addEventListener( 'mousemove', pointerMoved );
				document.addEventListener( 'mouseup', pointerReleased );
				document.addEventListener( 'touchmove', pointerMoved );
				document.addEventListener( 'touchend', pointerReleased );
			}

			function pointerPressed ( event ) {
				if ( event.type == 'mousedown' && event.which != 1 ) {
					return;
				}
				
				if ( ! shouldCaptureFn( event.target ) ) {
					return;
				}

				if ( domHelper.isDescendant( containerEl, event.target ) ) {
					event.preventDefault();
					
					lastPoints = getPoints( event );
					active++;
			
					if ( active === 1 ) {
						firstPointerPressed( event );
					}
				}
			}

			function pointerMoved ( event ) {
				if ( event && event.target && domHelper.isDescendant( containerEl, event.target ) ) {
					event.preventDefault();

					var points = getPoints( event );
					var averagePoint = points.reduce( getMidpoint );
					var averageLastPoint = lastPoints.reduce( getMidpoint );
					var targetBounds = targetEl.getBoundingClientRect();

					var tmpX = x + averagePoint.x - averageLastPoint.x;
					var tmpY = y + averagePoint.y - averageLastPoint.y;
					
					if ( points[1] ) {
						if ( ! canZoomWithPonter ) { return; }
						var scaleDiff = touchDistance( points[0], points[1] ) / touchDistance( lastPoints[0], lastPoints[1] );
						
						updateValues(
							tmpX - ( averagePoint.x - targetBounds.left ) * ( scaleDiff - 1 ),
							tmpY - ( averagePoint.y - targetBounds.top ) * ( scaleDiff - 1 ),
							scale * scaleDiff,
							targetBounds
						);
					} else {
						updateValues( tmpX, tmpY, scale );
					}

					lastPoints = points;
				}
			}

			function pointerReleased ( event ) {
				event.preventDefault();
				active--;
				lastPoints.pop();

				if ( active ) {
					lastPoints = getPoints( event );
					return;
				}

				document.removeEventListener( 'mousemove', pointerMoved );
				document.removeEventListener( 'mouseup', pointerReleased );
				document.removeEventListener( 'touchmove', pointerMoved );
				document.removeEventListener( 'touchend', pointerReleased );
			}

			function updateContainerBounds () {
				containerElSize = {
					width: containerEl.clientWidth,
					height: containerEl.clientHeight
				}
				
				targetElSize = {
					width: targetEl.clientWidth,
					height: targetEl.clientHeight
				};

				containerBounds = containerEl.getBoundingClientRect();
				updateValues( x, y, scale );
			}

			function resized () {
				clearTimeout( resizeTimeoutId );

				resizeTimeoutId = setTimeout( function () {
					updateContainerBounds();

					if ( Math.abs( scale - centerScale ) <= 0.01 ) {
						animateToCenter();
					}
				}, 100 );
			}

			function setToCenter () {
				var centerValues = getCenterValues();
				updateValues ( centerValues.x, centerValues.y, centerValues.scale );
							
				return self;
			}

			function animateToCenter () {
				var deltaX = 0;
				var deltaY = 0;
				var deltaScale = 0;
				var easing = 0.1;
				var centerValues = getCenterValues();

				centerScale = centerValues.scale;

				cancelAnimationFrame( scaleAnimationFrameId );
				cancelAnimationFrame( centerAnimationFrameId );
					
				function centerAnimationStep () {
					deltaX = centerValues.x - x;
					deltaY = centerValues.y - y;
					deltaScale = centerValues.scale - scale;

					if (
						Math.abs( deltaX ) > 1 ||
						Math.abs( deltaY ) > 1 ||
						Math.abs( deltaScale ) > 0.01
					) {
						updateValues( x + deltaX * easing, y + deltaY * easing, scale + deltaScale * easing );

						centerAnimationFrameId = requestAnimationFrame( centerAnimationStep );
					} else {
						updateValues( centerValues.x, centerValues.y, centerValues.scale );
					}
				}

				centerAnimationFrameId = requestAnimationFrame( centerAnimationStep );

				return self;
			}

			function settingUpdated ( key, value ) {
				if ( key === 'canZoomWithPointer' && typeof value === 'boolean' ){
					canZoomWithPonter = value;
				}
			}

			function setScale ( newScale ) {
				var targetX = ( containerElSize.width - targetElSize.width * newScale ) / 2;
				var targetY = ( containerElSize.height - targetElSize.height * newScale ) / 2;
				var deltaX = 0;
				var deltaY = 0;
				var deltaScale = 0;
				var easing = 0.2;

				cancelAnimationFrame( scaleAnimationFrameId );
				cancelAnimationFrame( centerAnimationFrameId );
					
				function scaleAnimationStep () {
					deltaX = targetX - x;
					deltaY = targetY - y;
					deltaScale = newScale - scale;

					if (
						Math.abs( deltaX ) > 1 ||
						Math.abs( deltaY ) > 1 ||
						Math.abs( deltaScale ) > 0.01
					) {
						updateValues( x + deltaX * easing, y + deltaY * easing, scale + deltaScale * easing );
												
						scaleAnimationFrameId = requestAnimationFrame( scaleAnimationStep );
					} else {
						updateValues( targetX, targetY, newScale );
					}
				}

				scaleAnimationStep();

				return self;
			}

			function getCenterValues () {
				updateContainerBounds();

				var targetScale = 1;

				if ( targetElSize.width > containerElSize.width || targetElSize.height > containerElSize.height ) {
					targetScale = Math.min(
						containerElSize.width / targetElSize.width,
						( containerElSize.height - 80 ) / targetElSize.height
					);
				}

				return {
					x: ( containerElSize.width - targetElSize.width * targetScale ) / 2,
					y: ( containerElSize.height - targetElSize.height * targetScale ) / 2,
					scale: targetScale
				};
			}

			this.updateContainerBounds = updateContainerBounds;
			this.reset = reset;
			this.setToCenter = setToCenter;
			this.animateToCenter = animateToCenter;
			this.setScale = setScale;
			this.settingUpdated = settingUpdated;
			this.resized = resized;
		}

		return PanZoom;
	}
);