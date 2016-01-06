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
			var visitCount = 0;
			var isOnline = false;

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

			function showLanguageHint ( languageName ) {
				if ( visitCount % 4 === 1 ) {
					var messages = [
						'welcome.newlanguage.0',
						'welcome.newlanguage.1',
						'welcome.newlanguage.2'
					];
					
					messages.forEach( function ( message, index ) {
						setTimeout( function () {
							publishers.message.dispatch( message, { innerHTML: true }, index < 2 ? 4000 : 6000 );
						}, index * 2600 );
					} );
				}
			}

			function updateVisits ( newVisitCount ) {
				visitCount = newVisitCount;
			}

			self.show = show;
			self.updateVisits = updateVisits;
			self.showLanguageHint = showLanguageHint;
		}

		return WelcomeView;
	}
);