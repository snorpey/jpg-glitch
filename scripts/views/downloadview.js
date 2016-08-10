/*global define*/
define(
	[ 'util/browser', 'util/el', 'util/time' ],
	function ( browser, elHelper, timeHelper ) {
		// the fullscreen button
		// includes a lot of code to account for the different browser implementations
		function DownloadView ( parentEl ) {
			if ( ! ( this instanceof DownloadView ) ) {
				return new DownloadView( parentEl );
			}

			var self = this;
			var isInFullScreen = false;
			var downloadLinkEl = elHelper.createLink(
					'file.download',
					'file.downloadtitle',
					null, null,
					'download-button',
					parentEl
				);

				downloadLinkEl.target = '_blank';;

			// the href attribute of the download link is updated every time
			// we change a parameter
			function updateDownloadLink ( newUrl, fileName ) {
				fileName = fileName || 'glitched';
				
				var newNameParts = fileName.split( '/' );
				var newName = newNameParts.length > 1 ? newNameParts.pop() : newNameParts[0];
				newName = newName.split( '.' ).shift();

				date = new Date();
				fileId = timeHelper.dateTimeToLocalStr( date );
				var newFileName = ( newName + '-glitched-' + fileId + '.png' )
				newFileName = newFileName.replace( /(\s|\/|:)/gmi, '-' );
				
				// setting the download attribute makes the browser
				// download the link target instead of opening it
				downloadLinkEl.setAttribute( 'download', newFileName );
				downloadLinkEl.href = newUrl;
			}
			
			self.updateDownloadLink = updateDownloadLink;
		}

		return DownloadView;
	}
);