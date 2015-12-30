/*global define*/
define(
	[ 'config', 'util/dom', 'util/object', 'util/string', 'util/addpublishers', 'lib/reqwest' ],
	function ( config, domHelper, objectHelper, stringHelper, addPublishers, reqwest ) {
		function LocalisationModel () {
			if ( ! ( this instanceof LocalisationModel ) ) {
				return new LocalisationModel();
			}

			var self = this;

			var publishers = addPublishers( self, 'update', 'error' );
			
			var textElData = [ ];
			var texts = '';
			var currentLanguage = '';

			var animationFrameId = NaN;
			var languageWasLoaded = false;
			
			var linkOptions = { links: { newTab: true } };

			function setLanguage ( newLanguage ) {
				if ( newLanguage !== currentLanguage && newLanguage in config.availableLanguages ) {
					loadLanguage( newLanguage );
				}
			}

			function settingUpdated ( name, value ) {
				if ( name === 'language' && value !== currentLanguage ) {
					loadLanguage( value );
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

			function loadLanguage ( languageName ) {
				languageWasLoaded = false;

				reqwest( {
					url: config.language.dir + '/' + languageName + '.json',
					type: 'json',
					method: 'get',
					error: function ( err, one, two ) {
						// if this is the first language to load, that's really bad.
						languageWasLoaded = true;
						publishers.error.dispatch( 'I\'m really sorry. I failed to load the language file for ' + languageName + '. This is a serious error that makes the app very hard to use. Maybe you can try reloading?' );
					},
					success: function ( res ) {
						languageLoaded( languageName, res );
					}
				} );
			}

			function languageLoaded ( newLanguageName, newTexts ) {
				currentLanguage = newLanguageName;
				languageWasLoaded = true;
				texts = newTexts;
				resetAllTexts();
				updateAllTexts();
			}

			function updateAllTexts () {
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
										item.el.innerHTML = stringHelper.markdownToHtml( getTextForKey( item.key, item.args ), linkOptions );
									} else {
										item.el[item.attribute] = getTextForKey( item.key, item.args );
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

			function getTextForKey ( key, args ) {
				var result = '';

				try {
					result = objectHelper.getObjectByString( key, texts );
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