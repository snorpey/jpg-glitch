/*global define*/
define(
	[ 'util/el', 'util/localizetext' ],
	function ( elHelper, loc ) {
		// the indiecator view diesplays errors and warnings in the top right
		// corner. they disappear after a while. the user can also click
		// on them to make them go away
		function IndicatorView ( parentEl ) {
			if ( ! ( this instanceof IndicatorView ) ) {
				return new IndicatorView( parentEl );
			}

			var self = this;
			var addQueue = [ ];
			var removeQueue = [ ];
			var visibleNotificationCount = 0;
			var isAdding = false;

			var timeToFadeOut = {
				message: 3500,
				error: 6000,
				welcome: 7000
			};

			var notificationsEl = elHelper.createEl( 'div', 'notifications', parentEl );

			function showWelcome ( message, data, fadeOutDelay ) {
				showNotification( 'welcome', message, data, fadeOutDelay );
			}

			function showMessage ( message, data ) {
				showNotification( 'message', message, data );
			}

			function showError ( message, data ) {
				showNotification( 'error', message, data );
			}

			function showNotification ( type, message, data, fadeOutDelay ) {
				fadeOutDelay = fadeOutDelay || timeToFadeOut[type] || 7000;

				if ( isAdding ) {
					addQueue.push( { type: type, message: message, data: data, fadeOutDelay: fadeOutDelay } );
				} else {
					addNotification( type, { message: message, data: data, fadeOutDelay: fadeOutDelay } );
				}	
			}

			function addNotification ( type, params ) {
				var notificationEl = elHelper.createEl( 'div', 'notification notification-' + type, notificationsEl );
				
				if ( params.data && params.data.innerHTML ) {
					if ( params.data.args && params.data.args.length ) {
						loc.apply( null, [ notificationEl, 'innerHTML', params.message ].concat( params.data.args ) );
					} else {
						loc.apply( null, [ notificationEl, 'innerHTML', params.message ] );
					}
				} else {
					loc( notificationEl, 'textContent', params.message );
				}

				notificationEl.id = 'notification-' + Date.now();
				notificationEl.addEventListener( 'click', notificationClicked );
				
				notificationsEl.classList.add( 'is-active' );
				
				isAdding = true;

				requestAnimationFrame( function () {
					notificationEl.classList.add( 'is-active' );
					notificationEl.classList.add( 'is-visible' );
					visibleNotificationCount++;
				} );

				setTimeout( function () {
					isAdding = false;
					addMessagesFromQueue();
				}, 400 );

				setTimeout( function () {
					removeNotification( notificationEl );
				}, params.fadeOutDelay );
			}

			function addMessagesFromQueue () {
				if ( addQueue.length && visibleNotificationCount < 4 ) {
					var nextMessage = addQueue.shift();
					addNotification( nextMessage.type, { message: nextMessage.message, data: nextMessage.data } );
				}
			}

			function removeNotification ( notificationEl ) {
				if ( removeQueue.indexOf( notificationEl.id ) === -1 ) {
					removeQueue.push( notificationEl.id );

					requestAnimationFrame( function () {
						notificationEl.classList.remove( 'is-active' );
					} );

					setTimeout( function () {
						requestAnimationFrame( function () {
							removeQueue.splice( removeQueue.indexOf( notificationEl.id ), 1 );
							
							notificationsEl.removeChild( notificationEl );
							visibleNotificationCount--;
							addMessagesFromQueue();

							if ( ! notificationsEl.children.length ) {
								notificationsEl.classList.remove( 'is-active' );
							}
						} );
					}, 500 );
				}
			}

			function notificationClicked ( event ) {
				if (
					event.target.classList.contains( 'notification' ) &&
					! event.target.classList.contains( 'notification-error' )
				) {
					removeNotification( event.target );
				}
			}

			self.showMessage = showMessage;
			self.showError = showError;
			self.showWelcome = showWelcome;
		}

		return IndicatorView;
	}
);