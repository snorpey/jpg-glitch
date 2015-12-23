/*global define*/
define(
	[ 'util/el', 'util/addpublishers', 'util/browser', 'views/dialog', 'util/time' ],
	function ( elHelper, addPublishers, browser, Dialog, timeHelper ) {
		function SaveView ( parentEl ) {
			if ( ! ( this instanceof SaveView ) ) {
				return new SaveView( parentEl );
			}

			var self = this;
			var publishers = addPublishers( self, 'savetolocalstorage', 'show' );

			var saveButtonEl;
			var navButtonEl;
			var dialog;
			var downloadLinkEl;
			var date;
			var fileId;
			var isActive = false;

			if ( browser.test( 'localforage' ) ) {
				navButtonEl = elHelper.createButton( 'file.saveinbrowser', 'file.saveinbrowsertitle', 'nav-button save-view-button', parentEl );

				dialog = Dialog( 'save-dialog', parentEl, navButtonEl );
				
				downloadLinkEl = elHelper.createLink(
					'file.download',
					'file.downloadtitle',
					null, null,
					'download-link button'
				);

				downloadLinkEl.target = '_blank';
				
				saveButtonEl = elHelper.createButton( 'file.save', 'file.savetitle', 'save-button button', null, saveButtonClicked )

				dialog
					.on( 'show', activate )
					.on( 'hide', deactivate )
					.add( saveButtonEl, downloadLinkEl );
			}

			function saveButtonClicked ( event ) {
				dialog.toggle();
				publishers.savetolocalstorage.dispatch();
			}

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

			function activate () {
				isActive = true;
				publishers.show.dispatch();
			}

			function deactivate () {
				isActive = false;
			}

			function getActive () {
				return isActive;
			}

			self.updateDownloadLink = updateDownloadLink;
			self.getActive = getActive;
		}

		return SaveView;
	}
);