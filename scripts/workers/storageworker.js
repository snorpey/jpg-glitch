importScripts( '../lib/localforage.nopromises.js' );
importScripts( '../lib/md5.js' );

var storageKey = 'items';
var entries = { };
var visitCount = 0;

self.addEventListener( 'message', receivedMessageEvent, false );

function receivedMessageEvent ( event ) {
	if ( event && event.data ) {
		if ( event.data.setStorageKey ) {
			setStorageKey( event.data.setStorageKey );
		}

		if ( event.data.add ) {
			add( event.data.add );
		}

		if ( event.data.removeCompletely ) {
			removeCompletely( event.data.removeCompletely );
		}

		if ( event.data.removeLocalData ) {
			removeLocalData( event.data.removeLocalData );
		}

		if ( event.data.removeImgurData ) {
			removeImgurData( event.data.removeImgurData );
		}

		if ( event.data.load ) {
			load();
		}

		if ( event.data.save ) {
			save();
		}

		if ( event.data.loadItem ) {
			loadItem( event.data.loadItem );
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

function add ( item ) {
	if ( item ) {
		var uid = createUID( item );

		if (
			entries[uid] &&
			entries[uid].deleteHash === item.deleteHash &&
			entries[uid].publicUrl === item.publicUrl &&
			entries[uid].imgurID === item.imgurID
		) {
			sendError( 'file.message.before' );
		} else {
			item.timestamp = Date.now();
			entries[uid] = item;
			
			save( function () {
				sendMessage( 'statusmessage', 'file.message.save' );
			} );
		}
	}
}

function removeCompletely ( uid ) {
	if ( uid && entries[uid] ) {
		if (
			(
				entries[uid].deleteHash ||
				entries[uid].publicUrl ||
				entries[uid].imgurID ||
				entries[uid].values ||
				entries[uid].src
			)
		) {
			console && console.log( 'cant delete storage item because theres still some data left', entries[uid] );
		} else {
			sendMessage( 'removeall', entries[uid] );
			delete entries[uid];
			
			save( function () {
				sendMessage( 'statusmessage', 'file.message.save' );
			} );
		}
	}
}

function removeLocalData ( uid ) {
	if ( uid && entries[uid] ) {
		if ( entries[uid].src ) {
			delete entries[uid].src;

			sendMessage( 'removelocaldata', entries[uid] );
		}

		if ( entries[uid].values ) {
			delete entries[uid].values;	
		}

		if ( ! ( entries[uid].deleteHash || entries[uid].publicUrl || entries[uid].imgurID ) ) {
			removeCompletely( uid );
		}

		save();
	}
}

function removeImgurData ( uid ) {
	if ( uid && entries[uid] ) {
		if ( entries[uid].deleteHash ) {
			sendMessage( 'removeimgurdata', entries[uid] );
			delete entries[uid].deleteHash;
		}
		
		if ( entries[uid].publicUrl ) {
			delete entries[uid].publicUrl;
		}

		if ( entries[uid].imgurID ) {
			delete entries[uid].imgurID;
		}

		if ( ! ( entries[uid].src || entries[uid].values ) ) {
			removeCompletely( uid );
		}

		save();
	}
}

function load ( callback ) {
	localforage.getItem( storageKey, function ( err, loadedData ) {
		if ( err ) {
			sendError( 'file.error.load' );
			console && console.log( 'localforage error', err );
		} else {
			entries = loadedData && loadedData.entries ? loadedData.entries : { };
			sendMessage( 'update', entries );
			
			visitCount = ( loadedData && loadedData.visitCount ) ? loadedData.visitCount : 1;
			isFirstVisit = ( loadedData && loadedData.lastVisit ) ? false : true;
						
			if ( isFirstVisit ) {
				sendMessage( 'firstvisit' );
			}
			
			save();

			if ( visitCount ) {
				sendMessage( 'visits', visitCount );
			}

			if ( typeof callback === 'function' ) {
				callback();
			}
		}
	} );
}

function save ( callback ) {
	localforage.setItem( storageKey, { entries: entries, lastVisit: Date.now(), visitCount: visitCount + 1 }, function ( err, savedData ) {
		if ( err ) {
			sendError( 'file.error.save' );
			console && console.log( 'localforage error', err );
		} else {
			if ( savedData ) {
				entries = savedData.entries;
				sendMessage( 'update', entries );
				sendMessage( 'save' );

				if ( typeof callback === 'function' ) {
					callback();
				}
			} else {
				console && console.log( 'no data was saved', savedData );
			}
		}
	} );
}

function loadItem ( uid ) {
	if ( entries[uid] ) {
		sendMessage( 'loaditem', { uid: uid, entries: entries[uid] } );
	}
}

function createUID ( item ) {
	var inputStr = 'N' + item.name + 'S' + item.src + 'L' + item.thumbnail.length || 0 + 'V';

	for ( var key in item.values ) {
		inputStr += key.substr( 0, 2 );
		inputStr += item.values[key];
	}

	return md5( inputStr );
}

function getLatestUID () {
	var latestUid;
	var latestTimestamp;
	var timestamp;
	
	for ( var uid in entries ) {
		timestamp = entries[uid].timestamp;

		if ( timestamp ) {
			if ( ! latestUid || timestamp > latestTimestamp ) {
				latestUid = uid;
				latestTimestamp = timestamp;
			}
		}
	}

	return latestUid;
}