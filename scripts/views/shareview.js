/*global define*/
define(
	[ 'config', 'util/addpublishers', 'views/dialog', 'util/el', 'util/browser', 'util/time', 'util/string', 'util/localizetext' ],
	function ( config, addPublishers, Dialog, elHelper, browser, timeHelper, strHelper, loc ) {
		// shareview lets users upload their glitched image to imgur and
		// share links on social media
		function ShareView ( parentEl ) {
			if ( ! ( this instanceof ShareView ) ) {
				return new ShareView( parentEl );
			}

			var self = this;
			var publishers = addPublishers( self, 'share', 'deletefromimgur' );
			var clearTimeoutId = NaN;
			var dialog;
			var canUpload = true;

			// storing some of the UI strings that we'll need a multiple times
			// later on.
			var isOnlineCssClass = 'is-online-only';
			var wasLoadedCssClass = 'was-loaded';
			var isLoadingCssClass = 'is-loading';
			var isEmptyCssClass = 'is-empty';
			var blankTargetStr = '_blank';
			var disabledAttr = 'disabled';

			var navButtonEl = elHelper.createButton( 'share.share', 'share.sharetitle', 'nav-button share-toggle-button ' + isOnlineCssClass, parentEl );

			var statusEl = elHelper.createEl( 'span', 'upload-status' );
			loc( statusEl, 'textContent', 'share.uploading' );

			var uploadInfoEl = elHelper.createEl( 'p', 'share-info' );
			loc( uploadInfoEl, 'innerHTML', 'share.info' );

			var uploadButtonEl = elHelper.createButton( 'share.upload', 'share.uploadtitle', 'upload-button button ' + isOnlineCssClass, null, uploadClicked );

			var imgLinkLabel = elHelper.createLabel( 'share.imagelink', 'img-link-input', 'img-link-label label' );
			var imgLinkEl = elHelper.createLink( null, 'share.opennewtabtitle', null, blankTargetStr, 'img-link' );
			imgLinkEl.id = 'img-link-input';

			var imgurLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'imgur-link button' );
			loc( imgurLinkEl, 'textContent', 'share.openon', getLocFn( 'share.target.imgur' ) );
			loc( imgurLinkEl, 'title', 'share.openontitle', getLocFn( 'share.target.imgur' ) );

			var redditShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'reddit-link button' );
			loc( redditShareLinkEl, 'textContent', 'share.shareon', getLocFn( 'share.target.reddit' ) );
			loc( redditShareLinkEl, 'title', 'share.shareontitle', getLocFn( 'share.target.reddit' ) );

			var twitterShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'twitter-link button' );
			loc( twitterShareLinkEl, 'textContent', 'share.shareon', getLocFn( 'share.target.twitter' ) );
			loc( twitterShareLinkEl, 'title', 'share.shareontitle', getLocFn( 'share.target.twitter' ) );

			var facebookShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'facebook-link button' );
			loc( facebookShareLinkEl, 'textContent', 'share.shareon', getLocFn( 'share.target.facebook' ) );
			loc( facebookShareLinkEl, 'title', 'share.shareontitle', getLocFn( 'share.target.facebook' ) );

			var pinterestShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'pinterest-link button' );
			loc( pinterestShareLinkEl, 'textContent', 'share.shareon', getLocFn( 'share.target.pinterest' ) );
			loc( pinterestShareLinkEl, 'title', 'share.shareontitle', getLocFn( 'share.target.pinterest' ) );

			var vkontakteShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'vkontakte-link button' );
			loc( vkontakteShareLinkEl, 'textContent', 'share.shareon', getLocFn( 'share.target.vkontakte' ) );
			loc( vkontakteShareLinkEl, 'title', 'share.shareontitle', getLocFn( 'share.target.vkontakte' ) );

			var sharedListEl;

			dialog = Dialog( 'share-dialog', parentEl, navButtonEl )
				.add( isOnlineCssClass, uploadInfoEl )
				.add( isOnlineCssClass, uploadButtonEl )
				.add( isOnlineCssClass, 'loader', statusEl )
				.add( isOnlineCssClass, imgLinkLabel, imgLinkEl )
				.add( isOnlineCssClass, twitterShareLinkEl )
				.add( isOnlineCssClass, facebookShareLinkEl )
				.add( isOnlineCssClass, imgurLinkEl )
				.add( isOnlineCssClass, redditShareLinkEl )
				.add( isOnlineCssClass, vkontakteShareLinkEl )
				.add( isOnlineCssClass, pinterestShareLinkEl );

			if ( browser.test( 'localforage' ) ) {
				sharedListEl = elHelper.createEl( 'ul', 'shared-list dialog-list' );

				var storageLabelEl = elHelper.createLabel( 'share.recentlyshared', null, 'load-label label' );

				dialog.add( 'has-list shared-list', storageLabelEl, sharedListEl );
			}

			function uploadClicked () {
				if ( canUpload ) {
					publishers.share.dispatch();
					hideShareLinks();
				}
			}

			function updateShareUrl ( imgUrl, imgId ) {
				clearTimeout( clearTimeoutId );

				var imgurLink = 'https://imgur.com/' + imgId;

				dialog.el.classList.add( 'has-links' );
				imgLinkEl.textContent = imgUrl;
				imgLinkEl.href = imgUrl;
				imgLinkEl.setAttribute( 'data-imgurid', imgId );
				imgurLinkEl.href = imgurLink;

				redditShareLinkEl.href = getShareUrl( 'reddit', imgUrl, imgurLink );
				twitterShareLinkEl.href = getShareUrl( 'twitter', imgUrl, imgurLink );
				facebookShareLinkEl.href = getShareUrl( 'facebook', imgUrl, imgurLink );
				pinterestShareLinkEl.href = getShareUrl( 'pinterest', imgUrl, imgurLink );
				vkontakteShareLinkEl.href = getShareUrl( 'vkontakte', imgUrl, imgurLink );
			}

			function clearShareUrl () {
				dialog.el.classList.remove( 'has-links' );
				imgLinkEl.textContent = '';
				imgLinkEl.href = 'about:blank';
				redditShareLinkEl.href = 'about:blank';
				twitterShareLinkEl.href = 'about:blank';
				facebookShareLinkEl.href = 'about:blank';
			}

			function showUpload () {
				dialog.el.classList.add( isLoadingCssClass );
			}

			function hideUpload () {
				dialog.el.classList.remove( isLoadingCssClass );
			}

			function uploadComplete ( imgUrl, imgId, imgDeleteHash ) {
				updateShareUrl( imgUrl, imgId );
				showShareLinks();				
			}

			function hideShareLinks ( uid ) {
				dialog.el.classList.remove( wasLoadedCssClass );
				
				clearTimeout( clearTimeoutId );
				clearTimeoutId = setTimeout( clearShareUrl, 400 );
				
				return self;
			}

			function showShareLinks () {
				dialog.el.classList.add( wasLoadedCssClass );

				return self;
			}

			function showOnlineOptions () {
				canUpload = true;
				uploadButtonEl.removeAttribute( disabledAttr );

				return self;
			}

			function hideOnlineOptions () {
				canUpload = false;
				uploadButtonEl.setAttribute( disabledAttr, disabledAttr );

				return self;
			}

			function updateList ( entries ) {
				if ( sharedListEl ) {
					if ( entries && Object.keys( entries ).length ) {
						var sharedListItemEl;

						for ( var uid in entries ) {
							sharedListItemEl = sharedListEl.querySelector( '[data-uid="' + uid + '"]' );
							
							if ( entries[uid].deleteHash && ! sharedListItemEl ) {
								addListItem( uid, entries[uid] );
							} else {
								if ( ! entries[uid].deleteHash && sharedListItemEl ) {
									removeListItem( sharedListItemEl );
								}
							}
						}

						var sharedListItemEls = sharedListEl.querySelectorAll( '[data-uid]' );

						for ( var i = 0, len = sharedListItemEls.length; i < len; i++ ) {
							var itemUid = sharedListItemEls[i].getAttribute( 'data-uid' );

							if ( itemUid && ! entries[itemUid] ) {
								removeListItem( sharedListItemEls[i] );
							}
						}
					}

					if ( hasSharedEntries( entries ) ) {
						sharedListEl.wrapperEl.classList.remove( isEmptyCssClass );
					} else {
						sharedListEl.wrapperEl.classList.add( isEmptyCssClass );
					}
				}

				return self;
			}

			function addListItem ( uid, entry ) {
				if ( entry ) {
					var date = timeHelper.timestampToDate( entry.timestamp );
					
					var listItemEl = elHelper.createEl( 'li', 'entry clear dialog-list-item', sharedListEl );
					listItemEl.setAttribute( 'data-uid', uid );
					
					var listItemThumbnailEl = elHelper.createEl( 'img', 'entry-thumb', listItemEl );
					listItemThumbnailEl.src = entry.thumbnail;
					listItemThumbnailEl.addEventListener( 'click', loadItemFn( uid ) );

					var textWrapperEl = elHelper.createEl( 'p', 'entry-text', listItemEl );

					var listItemNameEl = elHelper.createEl( 'p', 'entry-name', textWrapperEl );
					
					if ( entry.name ) {
						listItemNameEl.textContent = entry.name;;
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

					elHelper.createLink(
						'file.openlink',
						'file.openlinktitle',
						entry.publicUrl,
						blankTargetStr,
						'open-link-button button ' + isOnlineCssClass,
						buttonWrapperEl
					);

					elHelper.createButton(
						'file.offline',
						'file.offlinetitle',
						'item-offline-button button ' + isOnlineCssClass,
						buttonWrapperEl,
						removeItemFromImgurFn( uid, entry.deleteHash )
					);
				}
			}

			function removeListItem ( itemEl ) {
				itemEl.parentNode.removeChild( itemEl );
			}

			function removeItemFromImgurFn ( uid, deleteHash ) {
				return function () {
					var buttonEl = sharedListEl.querySelector( '[data-uid="' + uid + '"] .item-offline-button' );
					
					if ( buttonEl ) {
						buttonEl.setAttribute( disabledAttr, disabledAttr );
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

			function hasSharedEntries ( entries ) {
				var result = false;

				for ( var uid in entries ) {
					if ( entries[uid].deleteHash ) {
						result = true;
						break;
					}
				}
				return result;
			}

			function handleError ( message, data ) {
				if ( data.type === 'imgurremovefail' && data.uid ) {
					var buttonEl = sharedListEl.querySelector( '[data-uid="' + data.uid + '"] .item-offline-button' );
					
					if ( buttonEl ) {
						buttonEl.removeAttribute( disabledAttr );
					}
				}
			}

			// https://gist.github.com/dr-dimitru/7164862
			function getShareUrl ( service, imgUrl, imgurLink ) {
				var description = loc( 'share.link.description.edited' );
				var title = loc( 'share.link.title' );
				var params = { };

				if ( [ 'reddit', 'vkontakte' ].indexOf( service ) !== -1 ) {
					params.title = title;
				}

				if ( [ 'pinterest', 'vkontakte' ].indexOf( service ) !== -1 ) {
					params.description = description + ' ' + config.share.appURL;
					params.url = config.appURL;
				}

				if ( service === 'pinterest' ) {
					params.media = imgUrl;
				}

				if ( service === 'vkontakte' ) {
					params.image = imgUrl;
				}
				
				if ( service === 'reddit' ) {
					params.url = imgUrl;
				}
				
				if ( service === 'facebook' ) {
					params.u = imgurLink;
				}
				
				if ( service === 'twitter' ) {
					params.text = loc( 'share.link.description.withname' ) + ' ' + imgurLink + ' ' + config.share.appURL;
				}

				return config.share.sharer[service] + '?' + strHelper.objToQueryStr( params );
			}
			
			function getLocFn ( key ) {
				return function () {
					return loc( key );
				}
			}

			self.showUpload = showUpload;
			self.hideUpload = hideUpload;
			self.showShareLinks = showShareLinks;
			self.hideShareLinks = hideShareLinks;
			self.uploadComplete = uploadComplete;
			self.updateList = updateList;
			self.showOnlineOptions = showOnlineOptions;
			self.hideOnlineOptions = hideOnlineOptions;
			self.handleError = handleError;
		}

		return ShareView;
	}
);