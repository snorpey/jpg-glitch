/*global define*/
define(
	[ 'util/browser', 'util/addpublishers', 'util/el', 'util/time', 'util/localizetext', 'views/dialog' ],
	function ( browser, addPublishers, elHelper, timeHelper, loc, Dialog ) {
		function OpenFileView ( parentEl ) {
			if ( ! ( this instanceof OpenFileView ) ) {
				return new OpenFileView( parentEl );
			}

			var self = this;
			var fileOpenEl;
			var storageListEl;
			var emptyListEl;
			var navButtonEl;
			var dialog;

			var publishers = addPublishers( self, 'openfile', 'deletefromlocalstorage', 'openfromlocalstorage', 'deletefromimgur' );

			// check if the browser supports the filereader API
			// before displaying upload button
			if ( browser.getFeature( window, 'FileReader' ) ) {
				navButtonEl = elHelper.createButton( 'file.open', 'file.opentitle', 'open-button nav-button', parentEl );
				dialog = Dialog( 'open-file-dialog', parentEl, navButtonEl );

				var fileLabelEl = elHelper.createLabel( 'file.importtitle', 'input-file', 'file-label label' );

				fileInputEl = document.createElement( 'input' );
				fileInputEl.classList.add( 'file-input' );
				fileInputEl.type = 'file';
				fileInputEl.id = 'input-file';
				fileInputEl.accept = 'image/*';

				fileInputEl.addEventListener( 'change', fileSelected );

				var fileLabelButtonEl = elHelper.createLabel( 'file.import', 'input-file', 'file-button button' );
				
				dialog.add( fileLabelEl, fileInputEl, fileLabelButtonEl );

				self.fileinput = fileInputEl;				
			}

			if ( browser.test( 'localforage' ) ) {
				storageListEl = elHelper.createEl( 'ul', 'storage-list dialog-list' );

				var storageLabelEl = elHelper.createLabel( 'file.recent', 'file.recenttitle', 'load-label label' );

				dialog.add( storageLabelEl, storageListEl );
			}
			
			function fileSelected ( event ) {
				if (
					event.target &&
					event.target.files &&
					event.target.files[0]
				) {
					publishers.openfile.dispatch( event.target.files[0] );
				}
			}

			// compare all items in the list with what's in localstorage
			// and add, remove and edit them accordingly,
			// including images shared on imgur
			function updateList ( entries ) {
				if ( storageListEl ) {
					if ( entries && Object.keys( entries ).length ) {
						if ( emptyListEl ) {
							removeListItem( emptyListEl );
							emptyListEl = null;
						}

						var storageListItemEl;
						var offlineLinkEl;

						for ( var uid in entries ) {
							storageListItemEl = storageListEl.querySelector( '[data-uid="' + uid + '"]' );
							
							updateListItem( storageListItemEl, uid, entries[uid] );
						}

						var storageListItemEls = storageListEl.querySelectorAll( '[data-uid]' );

						for ( var i = 0, len = storageListItemEls.length; i < len; i++ ) {
							var itemUid = storageListItemEls[i].getAttribute( 'data-uid' );

							if ( itemUid && ! entries[itemUid] ) {
								removeListItem( storageListItemEls[i] );
							}
						}

					} else {
						// no entries but there are still elements in dom
						if ( entries && Object.keys( entries ).length === 0 ) {
							var storageListItemEls = storageListEl.querySelectorAll( '[data-uid]' );

							for ( var i = 0, len = storageListItemEls.length; i < len; i++ ) {
								removeListItem( storageListItemEls[i] );
							}
						}

						if ( ! emptyListEl ) {
							emptyListEl = elHelper.createEl( 'li', 'no-items' );
							loc( emptyListEl, 'textContent', 'file.norecent' );
							storageListEl.appendChild( emptyListEl );
						}
					}
				}

				return self;
			}

			function updateListItem ( listItemEl, uid, entry ) {
				if ( entry.src && entry.values && ! listItemEl ) {
					addListItem( uid, entry );
				} else {
					if ( listItemEl ) {
						if ( ! entry.src && ! entry.values ) {
							removeListItem( listItemEl );
						} else {
							var offlineLinkEl = listItemEl.querySelector( '.entry-shared-button-wrapper' );
							
							if ( ! entry.deleteHash && offlineLinkEl ) {
								offlineLinkEl.parentNode.removeChild( offlineLinkEl );
								listItemEl.classList.remove( 'has-offline-button' );
							}

							// add link el to open item online instead
							if ( entry.deleteHash && ! offlineLinkEl ) {
								addOnlineButtons( listItemEl, entry.deleteHash, entry.publicUrl, uid );
							}
						}
					}
				}
			}

			function addListItem ( uid, entry ) {
				if ( entry ) {
					var date = timeHelper.timestampToDate( entry.timestamp );
					
					var listItemEl = elHelper.createEl( 'li', 'entry clear dialog-list-item', storageListEl );
					listItemEl.setAttribute( 'data-uid', uid );
					
					var listItemThumbnailEl = elHelper.createEl( 'img', 'entry-thumb', listItemEl );
					listItemThumbnailEl.src = entry.thumbnail;
					listItemThumbnailEl.addEventListener( 'click', loadItemFn( uid ) );

					var textWrapperEl = elHelper.createEl( 'p', 'entry-text', listItemEl );

					var listItemNameEl = elHelper.createEl( 'p', 'entry-name', textWrapperEl );
					
					if ( entry.name ) {
						listItemNameEl.textContent = entry.name;
					} else {
						loc( listItemNameEl, 'textContent', 'file.untitled' );
					}

					var listItemDateEl = elHelper.createEl( 'time', 'entry-datetime', textWrapperEl );
					listItemDateEl.setAttribute( 'datetime', date.toISOString() );

					var dateEl = elHelper.createEl( 'span', 'entry-date', listItemDateEl );
					dateEl.textContent = timeHelper.dateToLocalStr( date );

					var timeEl = elHelper.createEl( 'span', 'entry-time', listItemDateEl );
					timeEl.textContent = timeHelper.timeToLocalStr( date );

					var buttonWrapperEl = elHelper.createEl( 'div', 'entry-button-wrapper', listItemEl );

					elHelper.createButton( 'file.del', 'file.deltitle', 'item-delete-button button', buttonWrapperEl, removeItemFn( uid ) );
					elHelper.createButton( 'file.openimage', 'file.openimagetitle', 'item-load-button button', buttonWrapperEl, loadItemFn( uid ) );

					if ( entry.deleteHash && entry.publicUrl ) {
						addOnlineButtons( listItemEl, entry.deleteHash, entry.publicUrl, uid );
					}
				}
			}

			function addOnlineButtons ( listEl, deleteHash, publicUrl, uid ) {
				var sharedButtonWrapperEl = elHelper.createEl( 'div', 'entry-shared-button-wrapper is-online-only', listEl );
				
				listEl.classList.add( 'has-offline-button' );

				elHelper.createButton(
					'file.offline',
					'file.offlinetitle',
					'item-offline-button button',
					sharedButtonWrapperEl,
					removeItemFromImgurFn( uid, deleteHash )
				);

				elHelper.createLink(
					'file.openlink',
					'file.openlinktitle',
					publicUrl,
					'_blank',
					'entry-shared-link button',
					sharedButtonWrapperEl
				);
			}

			function removeListItem ( itemEl ) {
				itemEl.parentNode.removeChild( itemEl );
			}

			function removeItemFn ( uid ) {
				return function () {
					publishers.deletefromlocalstorage.dispatch( uid );
				}
			}

			function removeItemFromImgurFn ( uid, deleteHash ) {
				return function () {
					var buttonEl = storageListEl.querySelector( '[data-uid="' + uid + '"] .item-offline-button' );
					
					if ( buttonEl ) {
						buttonEl.setAttribute( 'disabled', 'disabled' );
					}

					publishers.deletefromimgur.dispatch( uid, deleteHash );
				}
			}

			function loadItemFn ( uid ) {
				return function () {
					dialog.hide();
					publishers.openfromlocalstorage.dispatch( uid );
				}
			}

			self.updateList = updateList;
			self.dialog = dialog;
		}

		return OpenFileView;
	}	
);