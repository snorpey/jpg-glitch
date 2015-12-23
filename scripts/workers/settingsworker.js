importScripts( '../lib/localforage.nopromises.js' );

var settings;
var defaultSettings;
var storageKey = 'settings';

self.addEventListener( 'message', receivedMessageEvent, false );

function receivedMessageEvent ( event ) {
	if ( event && event.data ) {
		if ( event.data.load ) {
			load();
		}

		if ( event.data.save ) {
			save( event.data.save );
		}
		
		if ( event.data.setStorageKey ) {
			setStorageKey( event.data.setStorageKey );
		}

		if ( event.data.setDefaultSettings ) {
			setDefaultSettings( event.data.setDefaultSettings );
		}
	}
}

function sendMessage ( type, data ) {
	if ( typeof type === 'string' ) {
		if ( typeof data === 'undefined' ) {
			data = type;
		}

		var message = { };
		message[type] = data;
		self.postMessage( message );
	}
}

function sendError ( err ) {
	sendMessage( 'error', err );
}

function setStorageKey ( newKey ) {
	if ( newKey ) {
		storageKey = newKey;
	}
}

function setDefaultSettings ( newDefaultSettings ) {
	if ( newDefaultSettings ) {
		defaultSettings = newDefaultSettings;
	}
}

function load () {
	localforage.getItem( storageKey, function ( err, loadedSettings ) {
		if ( err ) {
			sendError( 'settings.error.load' );
			console && console.log( 'localforage error', err );
		} else {
			if ( ! loadedSettings && defaultSettings ) {
				settings = defaultSettings;
				save( defaultSettings );
			} else {
				settings = loadedSettings;
				sendMessage( 'update', settings );
			}
		}
	} );
}

function save ( newSettings ) {
	if ( newSettings ) {
		localforage.setItem( storageKey, newSettings, function ( err, savedSettings ) {
			if ( err ) {
				sendError( 'settings.error.save' );
				console && console.log( 'localforage error', err );
			} else {
				if ( savedSettings ) {
					settings = savedSettings || defaultSettings;
					sendMessage( 'update', settings );
				} else {
					console && console.log( 'no data was saved', savedSettings );
				}
			}
		} );
	}
}
