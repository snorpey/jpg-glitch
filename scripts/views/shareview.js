/*global define*/
define(
	[ 'util/addpublishers', 'views/dialog', 'util/el', 'util/browser', 'util/time', 'util/localizetext' ],
	function ( addPublishers, Dialog, elHelper, browser, timeHelper, loc ) {
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
			loc( imgurLinkEl, 'textContent', 'share.openon', 'Imgur' );
			loc( imgurLinkEl, 'title', 'share.openontitle', 'Imgur' );

			var redditShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'reddit-link button' );
			loc( redditShareLinkEl, 'textContent', 'share.shareon', 'Reddit' );
			loc( redditShareLinkEl, 'title', 'share.shareontitle', 'Reddit' );

			var twitterShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'twitter-link button' );
			loc( twitterShareLinkEl, 'textContent', 'share.shareon', 'Twitter' );
			loc( twitterShareLinkEl, 'title', 'share.shareontitle', 'Twitter' );

			var facebookShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'facebook-link button' );
			loc( facebookShareLinkEl, 'textContent', 'share.shareon', 'Facebook' );
			loc( facebookShareLinkEl, 'title', 'share.shareontitle', 'Facebook' );

			var pinterestShareLinkEl = elHelper.createLink( null, null, null, blankTargetStr, 'pinterest-link button' );
			loc( pinterestShareLinkEl, 'textContent', 'share.shareon', 'Pinterest' );
			loc( pinterestShareLinkEl, 'title', 'share.shareontitle', 'Pinterest' );

			var sharedListEl;

			dialog = Dialog( 'share-dialog', parentEl, navButtonEl )
				.add( isOnlineCssClass, uploadInfoEl )
				.add( isOnlineCssClass, uploadButtonEl )
				.add( isOnlineCssClass, 'loader', statusEl )
				.add( isOnlineCssClass, imgLinkLabel, imgLinkEl )
				.add( isOnlineCssClass, imgurLinkEl )
				.add( isOnlineCssClass, redditShareLinkEl )
				.add( isOnlineCssClass, twitterShareLinkEl )
				.add( isOnlineCssClass, facebookShareLinkEl )
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

				dialog.el.classList.add( 'has-links' );
				imgLinkEl.textContent = imgUrl;
				imgLinkEl.href = imgUrl;
				imgLinkEl.setAttribute( 'data-imgurid', imgId );
				imgurLinkEl.href = 'https://imgur.com/' + imgId;

				redditShareLinkEl.href = getRedditShareUrl( imgUrl );
				twitterShareLinkEl.href = getTwitterShareUrl( imgUrl );
				facebookShareLinkEl.href = getFacebookShareUrl( imgUrl );
				pinterestShareLinkEl.href = getPinterestShareUrl( imgUrl );
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

			function getShareDescription ( imgUrl ) {
				return 'Check out what I made with @snorpey’s glitch tool: ' + imgUrl + ' https://snorpey.github.io/jpg-glitch';
			}

			function getTwitterShareUrl ( imgUrl ) {
				return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent( getShareDescription( imgUrl ) );
			}

			function getRedditShareUrl ( imgUrl ) {
				return 'https://www.reddit.com/submit?url=' + encodeURIComponent( imgUrl ) + '&title=Glitch!';
			}

			// http://ar.zu.my/how-to-really-customize-the-deprecated-facebook-sharer-dot-php/
			function getFacebookShareUrl ( imgUrl ) {
				var text = 'Check out what I made with this glitch tool: https://snorpey.github.io/jpg-glitch';
				var shareUrl = 'https://www.facebook.com/sharer/sharer.php?s=100';
				shareUrl += '&p[url]=' + imgUrl;
				shareUrl += '&p[title]=Glitch!';
				shareUrl += '&p[images][0]=' + imgUrl;
				shareUrl += '&p[summary]=' + encodeURIComponent( text );

				return shareUrl;
			}

			function getPinterestShareUrl ( imgUrl ) {
				var text = 'I made this with snorpey\'s glitch tool: https://snorpey.github.io/jpg-glitch';
				var link = 'https://snorpey.github.io/jpg-glitch';
				var shareUrl = 'https://pinterest.com/pin/create/button/';
				shareUrl += '?url=' + encodeURIComponent( link );
				shareUrl += '&media=' + encodeURIComponent( imgUrl );
				shareUrl += '&description=' + encodeURIComponent( text );

				return shareUrl;
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