/*global define*/
define(
	[ 'config', 'lib/reqwest', 'util/addpublishers' ],
	function ( config, reqwest, addPublishers ) {
		// the ShareModel uploads and removes images from Imgur
		function ShareModel () {
			if ( ! ( this instanceof ShareModel ) ) {
				return new ShareModel();
			}

			var self = this;
			var base64Url;
			var publishers = addPublishers( self,
				'uploadstart', 'uploadend', 'uploadcomplete',
				'removestart', 'removeend', 'removecomplete',
				'error', 'statusmessage'
			);

			// http://stackoverflow.com/questions/17805456/upload-a-canvas-image-to-imgur-api-v3-with-javascript
			function upload () {
				if ( base64Url ) {
					publishers.uploadstart.dispatch();

					reqwest( {
						url: 'https://api.imgur.com/3/image.json',
						method: 'POST',
						headers: {
							Authorization: 'Client-ID ' + config.keys.imgur
						},
						data: {
							image: base64Url.split( ',' )[1],
							type: 'base64'
						},
						type: 'json',
						crossOrigin: true,
						success: uploadSuceeded,
						error: uploadFailed
					} );
				} else {
					uploadFailed( new Error( 'share.error.base64' ) );
				}

				return self;
			}

			function uploadSuceeded ( res ) {
				publishers.uploadend.dispatch();

				if ( res.status === 200 && res.data && res.data.link ) {
					var link = res.data.link.replace( 'http://', 'https://' );

					publishers.uploadcomplete.dispatch( link, res.data.id, res.data.deletehash );
					publishers.statusmessage.dispatch( 'share.message.upload', { innerHTML: true, args: [ link ] } );
				}
			}

			function uploadFailed ( err ) {
				publishers.uploadend.dispatch();
				publishers.error.dispatch( 'share.error.upload', { type: 'imguruploadfail' } );
				console && console.log( err.message || err );
			}

			function updateUrl ( url ) {
				base64Url = url;
				
				return self;
			}

			function remove ( uid, deleteHash ) {
				if ( deleteHash ) {
					publishers.removestart.dispatch( uid );

					reqwest( {
						url: 'https://api.imgur.com/3/image/' + deleteHash,
						method: 'DELETE',
						headers: {
							Authorization: 'Client-ID ' + config.keys.imgur
						},
						crossOrigin: true,
						success: function () { removeSucceeded( uid ); },
						error: function ( err ) { removeFailed( uid, err ); }
					} );
				}

				return self;
			}

			function removeSucceeded ( uid ) {
				publishers.removeend.dispatch( uid );
				publishers.removecomplete.dispatch( uid );
				publishers.statusmessage.dispatch( 'share.message.del' );
			}

			function removeFailed ( uid, err ) {
				publishers.removeend.dispatch( uid );
				publishers.error.dispatch( 'share.error.del', { type: 'imgurremovefail', uid: uid } );
				console && console.log( err.message || err );
			}

			self.upload = upload;
			self.updateUrl = updateUrl;
			self.remove = remove
		}

		return ShareModel;
	}
);