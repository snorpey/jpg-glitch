/*global define*/
define(
	[ 'util/addpublishers' ],
	function ( addPublishers ) {
		// all the welcomeView does is
		// show some welcome messages if the
		// user is visiting the first time
		function WelcomeView () {
			if ( ! ( this instanceof WelcomeView ) ) {
				return new WelcomeView();
			}

			var self = this;

			var publishers = addPublishers( self, 'message' );

			function show () {
				var messages = [
					'welcome.firstvisit.0',
					'welcome.firstvisit.1',
					'welcome.firstvisit.2'
				];

				messages.forEach( function ( message, index ) {
					setTimeout( function () {
						publishers.message.dispatch( message, 18000 );
					}, index * 3000 );
				} );
			}

			self.show = show;
		}

		return WelcomeView;
	}
);