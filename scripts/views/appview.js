/*global define*/
define(
	[ 'util/el' ],
	function ( elHelper ) {
		// the app view, wrapping element of the app
		// also updates the html element classes
		function AppView ( parentEl ) {
			if ( ! ( this instanceof AppView ) ) {
				return new AppView( parentEl );
			}

			var self = this;
			var el = elHelper.createEl( 'div', 'app', parentEl );

			function showOnlineOptions () {
				document.documentElement.classList.add( 'is-online' );

				return self;
			}

			function hideOnlineOptions () {
				document.documentElement.classList.remove( 'is-online' );

				return self;
			}
			
			self.el = el;
			self.showOnlineOptions = showOnlineOptions;
			self.hideOnlineOptions = hideOnlineOptions;
		}

		return AppView;
	}
);