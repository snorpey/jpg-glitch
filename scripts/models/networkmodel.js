/*global define*/
define(
	[ 'util/addpublishers' ],
	function ( addPublishers ) {
		// the NetworkModel updates the app if the device connectivity changed
		function NetworkModel () {
			if ( ! ( this instanceof NetworkModel ) ) {
				return new NetworkModel();
			}

			var self = this;
			var publishers = addPublishers( self, 'connectivitychange', 'disconnect', 'connect' );
			var isConnected;

			window.addEventListener( 'online', checkConnectivity );
			window.addEventListener( 'offline', checkConnectivity );

			function checkConnectivity () {
				if ( navigator.onLine !== isConnected ) {
					isConnected = navigator.onLine;
					
					publishers.connectivitychange.dispatch( isConnected );

					if ( isConnected ) {
						publishers.connect.dispatch();
					} else {
						publishers.disconnect.dispatch();
					}
				}

				return self;
			}

			self.checkConnectivity = checkConnectivity;
		}

		return NetworkModel;
	}
);