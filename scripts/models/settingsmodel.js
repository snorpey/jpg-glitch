/*global define*/
define(
	[ 'config', 'util/browser', 'util/object', 'util/addpublishers', 'lib/localforage.nopromises' ],
	function ( config, browser, objectHelper, addPublishers, localforage ) {
		function SettingsModel () {
			if ( ! ( this instanceof SettingsModel ) ) {
				return new SettingsModel();
			}

			var self = this;
			var publisherNames = [ 'update', 'error' ];
			var publishers = addPublishers( self, publisherNames );
			var useLocalForage = browser.test( 'localforage' ) && localforage;
			var worker;
			var defaultSettings = config.settings;
			var userLanguage = ( navigator.language || navigator.userLanguage || '' ).toLowerCase();
			
			var settings = { };

			if ( useLocalForage && browser.test( 'webworker' ) && browser.test( 'browserdb' ) && ! browser.test( 'safari' ) ) {
				worker = new Worker( config.workers.settings );
				worker.addEventListener( 'message', workerResponded, false );
				sendMessageToWorker( 'setStorageKey', config.keys.settings );
				sendMessageToWorker( 'setDefaultSettings', defaultSettings );
			} else {
				settingsUpdated( defaultSettings );
			}

			function getSetting ( key ) {
				return settings[key];
			}

			function getSettingValue ( key ) {
				var setting = getSetting( key );
				
				if ( setting ) {
					return setting.value;
				} else {
					return;
				}
			}

			function getSettings () {
				return objectHelper.getCopy( settings );
			}

			function setValue ( key, value ) {
				var wasUpdated = false;

				if (
					typeof key === 'string' &&
					typeof settings[key] !== 'undefined' &&
					typeof value === typeof settings[key].value &&
					value !== settings[key].value
				) {
					settings[key].value = value;
					wasUpdated = true;
				}

				if ( wasUpdated ) {
					if ( useLocalForage ) {
						save( settings );
					} else {
						settingsUpdated( settings );
					}
				}

				return self;
			}

			function save ( newSettings ) {
				if ( useLocalForage ) {
					if ( worker ) {
						sendMessageToWorker( 'save', newSettings );
					} else {
						localforage.setItem( config.keys.settings, newSettings, function ( err, savedSettings ) {
							if ( err ) {
								sendError( 'settings.error.save' );
								console && console.log( 'localforage error', err );
							} else {
								if ( savedSettings ) {
									settingsUpdated( savedSettings );
								} else {
									console && console.log( 'no data was saved', savedSettings );
								}
							}
						} );
					}
				}
			}

			function load () {
				if ( useLocalForage ) {
					if ( worker ) {
						sendMessageToWorker( 'load' );
					} else {
						localforage.getItem( config.keys.settings, function ( err, loadedSettings ) {
							if ( err ) {
								sendError( 'settings.error.load' );
								console && console.log( 'localforage error', err );
							} else {
								settingsUpdated( loadedSettings );
							}
						} );
					}
				} else {
					settingsUpdated( settings || defaultSettings );
				}
			}

			function sendMessageToWorker ( type, data ) {
				if ( typeof type === 'string' ) {
					if ( typeof data === 'undefined' ) {
						data = type;
					}

					var message = { };
					message[type] = data;
					worker.postMessage( message );
				}
			}

			function workerResponded ( event ) {
				if ( event && event.data ) {
					publisherNames.forEach( function ( type ) {
						if ( typeof event.data[type] !== 'undefined' ) {
							if ( type === 'update' ) {
								settingsUpdated( event.data[type] );
							} else {
								if ( publishers[type] === type ) {
									publishers[type].dispatch()
								} else {
									publishers[type].dispatch( event.data[type] )
								}
							}
						}
					} );
				}
			}

			function settingsUpdated ( newSettings ) {
				if ( newSettings ) {
					settings = newSettings || defaultSettings;

					if ( settings !== defaultSettings ) {
						for ( var name in defaultSettings ) {
							if ( ! settings[name] ) {
								settings[name] = defaultSettings[name];
							}
						}
					}

					for ( var name in settings ) {
						publishers.update.dispatch( name, settings[name].value, settings[name].options );
					}

				} else {
					settings = defaultSettings;
					save( settings );
				}
			}

			self.getSetting = getSetting;
			self.getSettingValue = getSettingValue;
			self.getSettings = getSettings;
			self.setValue = setValue;
			self.load = load;
		}

		return SettingsModel;
	}
);