/*global require, requirejs, define*/
// gf: http://requirejs.org/docs/api.html#config
requirejs.config( {
	baseUrl: 'scripts/',
	waitSeconds: 10
} );

require( [
	'config',
	'util/browser',
	'views/appview',
	'views/navview',
	'views/controlsview',
	'views/openfileview',
	'views/fullscreenview',
	'views/webcamview',
	'views/canvasview',
	'views/canvascontrolsview',
	'views/saveview',
	'views/shareview',
	'views/indicatorview',
	'views/workspacenavview',
	'views/aboutview',
	'views/draganddropview',
	'views/workspaceview',
	'views/welcomeview',
	'views/settingsview',
	'models/controlsmodel',
	'models/imagemodel',
	'models/glitchmodel',
	'models/storagemodel',
	'models/sharemodel',
	'models/networkmodel',
	'models/settingsmodel',
	'models/localisationmodel',
	'lib/localforage.nopromises'
], function (
	config,
	browser,
	AppView,
	NavView,
	ControlsView,
	OpenFileView,
	FullscreenView,
	WebCamView,
	CanvasView,
	CanvasControlsView,
	SaveView,
	ShareView,
	IndicatorView,
	WorkspaceNavView,
	AboutView,
	DragAndDropView,
	WorkspaceView,
	WelcomeView,
	SettingsView,
	ControlsModel,
	ImageModel,
	GlitchModel,
	StorageModel,
	ShareModel,
	NetworkModel,
	SettingsModel,
	LocalisationModel,
	localforage
) {
	var wasAppLoadComplete = false;

	var imageModel = ImageModel();
	var glitchModel = GlitchModel();
	var shareModel = ShareModel();
	var storageModel = StorageModel();
	var controlsModel = ControlsModel( config.defaultControlParams );
	var networkModel = NetworkModel();
	var settingsModel = SettingsModel();
	var localisationModel = LocalisationModel.sharedInstance;

	var appView = AppView( document.body );
	var navView = NavView( appView.el );
	var workspaceView = WorkspaceView( appView.el );
	var workspaceNavView = WorkspaceNavView( workspaceView.el );
	var canvasControlsView = CanvasControlsView( workspaceNavView.el );
	var controlsView = ControlsView( workspaceNavView.el, canvasControlsView.el, config.defaultControlParams );
	var indicatorView = IndicatorView( workspaceView.el );
	var canvasView = CanvasView( workspaceView.el, navView.el );
	var openFileView = OpenFileView( navView.el );
	var saveView = SaveView( navView.el );
	var webcamView = WebCamView( navView.el );
	var shareView = ShareView( navView.el );
	var aboutView = AboutView( navView.el );
	var settingsView = SettingsView( navView.el );
	var fullscreenView = FullscreenView( workspaceView.el );
	var dragAndDropView = DragAndDropView( canvasView.el );
	var welcomeView = WelcomeView();
	
	function init () {
		addCSSClasses();
		addSubscribers();

		networkModel.checkConnectivity();

		if ( browser.test( 'localforage' ) && localforage ) {
			setUpLocalForage( function () {
				storageModel.load();
				settingsModel.load();
			} );
		} else {
			settingsModel.load();
			controlsView.loadInitialValues();
			loadInitialItem();
		}
	}

	// hooks up all messaging between items
	// using publisher/subscriber model
	function addSubscribers () {
		controlsView
			.on( 'update', controlsModel.setValue )
			.on( 'random', controlsModel.randomizeValues );

		controlsModel
			.on( 'update', controlsView.setValue )
			.on( 'update', glitchModel.setValue )
			.on( 'update', shareView.hideShareLinks );

		canvasControlsView
			.on( 'center', canvasView.animateToCenter )
			.on( 'scale', canvasView.setScale );

		canvasView
			.on( 'scale', canvasControlsView.setScale )
			.on( 'dblclick', canvasView.animateToCenter );

		openFileView
			.on( 'openfile', imageModel.loadFromFile )
			.on( 'openfromlocalstorage', storageModel.loadItem )
			.on( 'deletefromlocalstorage', storageModel.removeLocalData )
			.on( 'deletefromimgur', shareModel.remove );

		saveView
			.on( 'savetolocalstorage', glitchModel.getImageGenerationFn( saveNewEntry ) )
			.on( 'savetolocalstorage', updateDownloadLink )
			.on( 'show', updateDownloadLink );

		navView.on( 'toggleend', canvasView.resized );

		imageModel
			.on( 'load', glitchModel.setImageData )
			.on( 'load', openFileView.dialog.hide )
			.on( 'load', canvasView.animateToCenter )
			.on( 'load', canvasView.show )
			.on( 'update', canvasView.hide )
			.on( 'error', indicatorView.showError )
			.on( 'error', indicatorView.hideLoading )
			.on( 'statusmessage', indicatorView.showMessage );

		glitchModel
			.on( 'glitch', canvasView.putImageData )
			.on( 'glitch', canvasView.createImageUrl( shareModel.updateUrl ) )
			.on( 'glitch', updateDownloadLink );

		shareView
			.on( 'share', shareModel.upload )
			.on( 'deletefromimgur', shareModel.remove );

		shareModel
			.on( 'uploadstart', shareView.showUpload )
			.on( 'uploadend', shareView.hideUpload )
			.on( 'uploadcomplete', shareView.uploadComplete )
			.on( 'uploadcomplete', glitchModel.getImageGenerationFn( saveNewEntry ) )
			.on( 'removecomplete', storageModel.removeImgurData )
			.on( 'removecomplete', shareView.hideShareLinks )
			.on( 'error', indicatorView.showError )
			.on( 'error', shareView.handleError )
			.on( 'statusmessage', indicatorView.showMessage );

		webcamView
			.on( 'video', imageModel.loadFromVideo )
			.on( 'error', indicatorView.showError );

		dragAndDropView
			.on( 'drop', imageModel.loadFromFile )
			.on( 'drop', canvasView.hide );

		welcomeView
			.on( 'message', indicatorView.showWelcome );

		workspaceView
			.on( 'click', navView.closeSmallScreenNav );

		settingsView
			.on( 'settingchange', settingsModel.setValue );

		storageModel
			.on( 'update', openFileView.updateList )
			.on( 'update', shareView.updateList )
			.on( 'update', loadInitialItem )
			.on( 'loaditem', loadEntry )
			.on( 'statusmessage', indicatorView.showMessage )
			.on( 'error', indicatorView.showError )
			.on( 'firstvisit', welcomeView.show );

		networkModel
			.on( 'connect', shareView.showOnlineOptions )
			.on( 'disconnect', shareView.hideOnlineOptions )
			.on( 'connect', appView.showOnlineOptions )
			.on( 'disconnect', appView.hideOnlineOptions );

		settingsModel
			.on( 'update', canvasView.panZoom.settingUpdated )
			.on( 'update', imageModel.settingUpdated )
			.on( 'update', settingsView.settingUpdated )
			.on( 'update', localisationModel.settingUpdated )
			.on( 'error', indicatorView.showError );

		localisationModel
			.on( 'error', indicatorView.showError )
			.on( 'error', hideAppLoader )
			.on( 'update', hideAppLoader );
	}

	function addCSSClasses () {
		if ( browser.test( 'touch' ) ) {
			document.documentElement.classList.add( 'has-touch' );
		}
	}

	function setUpLocalForage ( callback ) {
		if ( localforage ) {
			localforage.config( config.localForage );

			var driver = [
				localforage.WEBSQL,
				localforage.INDEXEDDB,
				localforage.LOCALSTORAGE
			];

			if ( browser.test( 'safari' ) ) {
				driver = localforage.LOCALSTORAGE;
			}
		
			localforage
				.setDriver( driver )
				.then( callback );
		} else {
			if ( typeof callback === 'function' ) {
				callback();
			}
		}
	}

	function loadInitialItem ( entries ) {
		var lastItemUID = -1;

		// load last saved item if possible,
		// otherwise, load default image
		if ( entries && Object.keys( entries ).length ) {
			var now = Date.now();
			var delta = Infinity;

			for ( var uid in entries ) {
				if ( entries[uid].timestamp ) {
					if ( now - entries[uid].timestamp < delta ) {
						delta = now - entries[uid].timestamp;
						lastItemUID = uid;
					}
				}
			}
		}

		storageModel.off( 'update', loadInitialItem );

		if ( lastItemUID !== -1 ) {
			storageModel.loadItem( lastItemUID );
		} else {
			imageModel.loadFromURL( config.defaultImage.path, config.defaultImage.name );
			controlsView.loadInitialValues();
		}
	}

	// saves new item to local storage
	function saveNewEntry ( thumbnail, publicURL, imgurID, deleteHash ) {
		var item = {
			thumbnail: thumbnail,
			src: imageModel.getLastImageSRC(),
			values: controlsModel.getValues(),
			name: imageModel.getLastFileName()
		};

		if ( publicURL ) {
			item.publicUrl = publicURL;
		}

		if ( imgurID ) {
			item.imgurID = imgurID;
		}

		if ( deleteHash ) {
			item.deleteHash = deleteHash;
		}

		storageModel.add( item );
	}

	// loads item from localstorage
	function loadEntry ( uid, entry ) {
		for ( var key in entry.values ) {
			controlsModel.setValue( key, entry.values[key] );
		}
		
		imageModel.loadFromURL( entry.src, entry.name );
	}

	// updates the download link url every time the controls were updated.
	// add a delay of 200 to we don't update the DOM too often
	var downloadLinkTimeoutId = NaN;

	function updateDownloadLink () {
		if ( saveView.getActive() ) {
			clearTimeout( downloadLinkTimeoutId );

			downloadLinkTimeoutId = setTimeout( function () {
				glitchModel.getImageGenerationFn( saveView.updateDownloadLink, 'original' )( imageModel.getLastFileName() )
			}, 200 );				
		}
	}

	function hideAppLoader () {
		if ( ! wasAppLoadComplete ) {
			requestAnimationFrame ( function () {
				wasAppLoadComplete = true;
				document.documentElement.classList.add( 'is-loaded' );
				
				setTimeout( function () {
					document.documentElement.classList.remove( 'is-loading' );
				}, 10 );
			} );
		}
	}

	init();
} );