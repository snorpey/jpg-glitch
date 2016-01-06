/*global define*/
define(
	[ 'config', 'util/browser', 'util/addpublishers', 'lib/md5', 'lib/localforage.nopromises', 'models/localisationmodel' ],
	function ( config, browser, addPublishers, md5, localforage, LocalisationModel ) {
		// the StorageModel takes care of loading and saving data to localStorage.
		// It stores the used glitch values as well as the imgur address if the
		// image was shared.
		// It generares a UID for each image to avoid having to save the 
		// same image multiple times.
		// If an image was updated (shared/deleted), it updates the corresponding
		// object in localstorage
		function StorageModel () {
			if ( ! ( this instanceof StorageModel ) ) {
				return new StorageModel();
			}

			var self = this;
			var isFirstVisit = false;
			var visitCount = 0;
			var entries = { };
			var useLocalForage = browser.test( 'localforage' ) && localforage;
			var worker;

			var publisherNames = [
				'update', 'save', 'loaditem',
				'removeall', 'removelocaldata', 'removeimgurdata',
				'visits', 'firstvisit', 'error', 'statusmessage'
			];

			var publishers = addPublishers( self, publisherNames );

			storageKey = config.keys.storage;

			if ( useLocalForage && browser.test( 'webworker' ) && browser.test( 'browserdb' ) && ! browser.test( 'safari' ) ) {
				worker = new Worker( config.workers.storage );
				worker.addEventListener( 'message', workerResponded, false );
				sendMessageToWorker( 'setStorageKey', storageKey );
			}

			function add ( item ) {
				if ( useLocalForage && item ) {
					if ( worker ) {
						sendMessageToWorker( 'add', item );
					} else {
						var uid = createUID( item );

						if (
							entries[uid] &&
							entries[uid].deleteHash === item.deleteHash &&
							entries[uid].publicUrl === item.publicUrl &&
							entries[uid].imgurID === item.imgurID
						) {
							publishers.statusmessage.dispatch( 'file.message.before' );
						} else {
							item.timestamp = Date.now();
							entries[uid] = item;
							
							save( function () {
								publishers.statusmessage.dispatch( 'file.message.save' );
							} );
						}
					}
				}

				return self;
			}

			function removeCompletely ( uid ) {
				if ( useLocalForage && uid ) {
					if ( worker ) {
						sendMessageToWorker( 'removeCompletely', uid );
					} else {
						if (
							entries[uid] &&
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
							publishers.removeall.dispatch( entries[uid] );
							delete entries[uid];
							
							save( function () {
								publishers.statusmessage.dispatch( 'file.message.del' );
							} );
						}
					}
				}
			}

			function removeLocalData ( uid ) {
				if ( useLocalForage && uid ) {
					if ( worker ) {
						sendMessageToWorker( 'removeLocalData', uid );
					} else {
						if ( entries[uid] ) {
							if ( entries[uid].src ) {
								delete entries[uid].src;

								publishers.removelocaldata.dispatch( entries[uid] );
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
				}

				return self;
			}

			function removeImgurData ( uid ) {
				if ( useLocalForage && uid ) {
					if ( worker ) {
						sendMessageToWorker( 'removeImgurData', uid );
					} else {
						if ( entries[uid] ) {
							if ( entries[uid].deleteHash ) {
								publishers.removeimgurdata.dispatch( entries[uid] );
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
				}

				return self;
			}

			function load ( callback ) {
				if ( useLocalForage ) {
					if ( worker ) {
						sendMessageToWorker( 'load' );
					} else {
						localforage.getItem( storageKey, function ( err, loadedData ) {							
							if ( err ) {
								publishers.error.dispatch( 'file.error.load' );
								console && console.log( 'localforage error', err );
							} else {
								entries = loadedData && loadedData.entries ? loadedData.entries : { };
								publishers.update.dispatch( entries );

								visitCount = ( loadedData && loadedData.visitCount ) ? loadedData.visitCount : 1;
								isFirstVisit = ( loadedData && loadedData.lastVisit ) ? false : true;
								
								if ( isFirstVisit ) {
									publishers.firstvisit.dispatch();
								}
								
								save();

								if ( visitCount ) {
									publishers.visitCount.dispatch( visitCount );
								}

								if ( typeof callback === 'function' ) {
									callback();
								}
							}
						} );
					}
				}

				return self;
			}

			function save ( callback ) {
				if ( useLocalForage ) {
					if ( worker ) {
						sendMessageToWorker( 'save' );
					} else {
						localforage.setItem( storageKey, { entries: entries, lastVisit: Date.now(), visitCount: visitCount + 1 }, function ( err, savedData ) {
							if ( err ) {
								publishers.error.dispatch( 'file.error.save' );
								console && console.log( 'localforage error', err );
							} else {
								if ( savedData ) {
									entries = savedData.entries;
									publishers.update.dispatch( entries );
									publishers.save.dispatch();

									if ( typeof callback === 'function' ) {
										callback();
									}
								} else {
									console && console.log( 'no data was saved', savedData );
								}
							}
						} );
					}
				}

				return self;
			}

			function loadItem ( uid ) {
				if ( useLocalForage ) {
					if ( worker ) {
						sendMessageToWorker( 'loadItem', uid );
					} else {
						if ( entries[uid] ) {
							publishers.loaditem.dispatch( uid, entries[uid] );
						}
					}
				}

				return self;
			}

			function workerResponded ( event ) {
				if ( event && event.data ) {
					publisherNames.forEach( function ( type ) {
						if ( typeof event.data[type] !== 'undefined' ) {
							if ( type === 'loaditem' ) {
								publishers[type].dispatch( event.data[type].uid, event.data[type].entries );
							} else {
								if ( publishers[type] === type ) {
									// if message is empty, the worker sends the type as data.
									publishers[type].dispatch()
								} else {
									publishers[type].dispatch( event.data[type] )
								}
							}
						}
					} );
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

			self.add = add;
			self.removeImgurData = removeImgurData;
			self.removeLocalData = removeLocalData;
			self.load = load;
			self.loadItem = loadItem;
			self.removeImgurData = removeImgurData;
			self.getLatestUID = getLatestUID;
		}

		return StorageModel;
	}
);