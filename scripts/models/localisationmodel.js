/*global define*/
define(
	[ 'config', 'util/dom', 'util/object', 'util/string', 'util/addpublishers', 'lib/reqwest', 'lib/localforage.nopromises' ],
	function ( config, domHelper, objectHelper, stringHelper, addPublishers, reqwest, localforage ) {
		function LocalisationModel () {
			if ( ! ( this instanceof LocalisationModel ) ) {
				return new LocalisationModel();
			}

			var self = this;

			var publishers = addPublishers( self, 'update', 'newlanguage', 'error' );
			
			var textElData = [ ];
			var texts = '';
			var currentLanguage = '';

			var animationFrameId = NaN;
			var languageWasLoaded = false;
			
			var linkOptions = { links: { newTab: true } };

			var userLanguage = ( navigator.language || navigator.userLanguage || '' ).toLowerCase();

			// detect user language
			if ( userLanguage !== '' ) {
				var matchingLanguageWasFound = false;

				if ( config.settings.language.options.indexOf( userLanguage ) > -1 ) {
					config.settings.language.value = userLanguage;
					matchingLanguageWasFound = true;
				} else {
					// en-au -> en-us
					config.settings.language.options.forEach( function ( languageOption ) {
						if ( userLanguage.substr( 0, 2 ) === languageOption.substr( 0, 2 ) ) {
							config.settings.language.value = languageOption;
							matchingLanguageWasFound = true;
						}
					} );
				}

				if ( ! matchingLanguageWasFound ) {
					setTimeout( publishers.newlanguage.dispatch, 100, userLanguage );
				}
			}

			loadLanguageFromStorage();

			// receive message from the translation tool and
			// show the new language
			if ( config.language.debug ) {
				addEventListener( 'message', windowMessageReceived, false );
			}

			function setLanguage ( newLanguageName ) {
				if ( newLanguageName !== currentLanguage && config.settings.language.options.indexOf( newLanguageName ) !== -1 ) {
					loadLanguageFile( newLanguageName );
				}
			}

			function settingUpdated ( name, value ) {
				if ( name === 'language' && value !== currentLanguage ) {
					setLanguage( value );
				}
			}

			function windowMessageReceived ( event ) {
				if ( event.origin === config.origin && event.data.language ) {
					languageWasLoaded = true;
					texts = event.data.language;
					resetAllTexts();
					updateAllTexts( event.data.language );
				}
			}

			function localizeText ( el, attribute, key ) {
				if ( el && attribute && key ) {
					textElData.push( { el: el, attribute: attribute, key: key, wasUpdated: false, args: getArgs( arguments ) } );
				} else {
					if ( typeof el === 'string' ) {
						return getTextForKey( el, getArgs( arguments, 1 ) );
					}
				}

				updateAllTexts();
			}

			function loadLanguageFile ( languageName ) {
				languageWasLoaded = false;

				reqwest( {
					url: config.language.dir + '/' + languageName + '.json',
					type: 'json',
					method: 'get',
					error: function ( err ) {
						// if this is the first language to load, that's really bad.
						languageWasLoaded = true;
						publishers.error.dispatch( 'I\'m really sorry. I failed to load the language file for ' + languageName + '. This is a serious error that makes the app very hard to use. Maybe you can try reloading?' );
					},
					success: function ( res ) {
						languageLoaded( res.lang.toLowerCase(), res );
					}
				} );
			}

			function loadLanguageFromStorage () {
				localforage.getItem( config.keys.language, function ( err, loadedLanguage ) {
					if ( ! err ) {
						if ( loadedLanguage && loadedLanguage.lang ) {
							languageLoaded( loadedLanguage.lang, loadedLanguage );
						}
					}
				} );
			}

			function languageLoaded ( newLanguageName, newLanguage ) {
				currentLanguage = newLanguageName;
				languageWasLoaded = true;
				texts = newLanguage;
				
				saveLanguage( newLanguage );
				resetAllTexts();
				updateAllTexts();

				if ( config.language.debug ) {
					postMessage( { availableLanguages: config.settings.language.options }, config.origin );
					postMessage( { loaded: true }, config.origin );
				}
			}

			function saveLanguage ( newLanguage ) {
				localforage.setItem( config.keys.language, newLanguage );
			}

			function updateAllTexts ( languageData ) {
				if ( languageWasLoaded ) {
					cancelAnimationFrame( animationFrameId );

					animationFrameId = requestAnimationFrame( function () {
						var item;
						var args;

						for ( var i = textElData.length - 1; i >= 0; i-- ) {
							item = textElData[i];
							
							if ( domHelper.isElement( item.el ) ) {
								if ( ! item.wasUpdated ) {
									if ( item.attribute === 'innerHTML' ) {
										item.el.innerHTML = stringHelper.markdownToHtml( getTextForKey( item.key, item.args, languageData ), linkOptions );
									} else {
										item.el[item.attribute] = getTextForKey( item.key, item.args, languageData );
									}
									
									item.wasUpdated = true;
								}
							} else {
								textElData.splice( i, 1 );
							}
						}

						publishers.update.dispatch();
					} );
				}
			}

			function resetAllTexts () {
				textElData.forEach( function ( item ) {
					item.wasUpdated = false;
				} );
			}

			function getTextForKey ( key, args, languageData ) {
				var result = '';

				languageData = languageData || texts;

				try {
					result = objectHelper.getObjectByString( key, languageData );
				} catch ( e ) {
					if ( languageWasLoaded ) {
						result = key
					}
				};

				if ( args && args.length ) {
					var regex;

					args.forEach( function ( arg, index ) {
						regex = new RegExp( '{\\$' + ( index + 1 ) + '}' );
						result = result.replace( regex, arg );
					} );
				}

				return result;
			}

			// http://mzl.la/1RDxjVO
			function getArgs ( args, firstIndex ) {
				firstIndex = firstIndex || 3;
				var result;

				if ( args.length > firstIndex ) {
					result = [ ];
				}

				for ( var i = firstIndex, len = args.length; i < len; i++ ) {
					result[result.length] = args[i];
				}

				return result;
			}

			self.setLanguage = setLanguage;
			self.localizeText = localizeText;
			self.settingUpdated = settingUpdated;
		}

		LocalisationModel.sharedInstance = LocalisationModel();

		return LocalisationModel;
	}
);