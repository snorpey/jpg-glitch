// most of this was taken from @adactio's serviceworker
// https://adactio.com/journal/9775
// https://adactio.com/serviceworker.js

var version = 'v1.0::';
var staticCacheName = version + 'static';
var pagesCacheName = version + 'pages';
var imagesCacheName = version + 'images';

function updateStaticCache () {
	return caches
		.open( staticCacheName )
		.then( function ( cache ) {
			// These items won't block the installation of the Service Worker
			cache
				.addAll( [
					'images/icon/alert-circle.svg',
					'images/icon/camera.svg',
					'images/icon/content-save.svg',
					'images/icon/delete.svg',
					'images/icon/emoticon.svg',
					'images/icon/fullscreen-exit.svg',
					'images/icon/fullscreen.svg',
					'images/icon/information-outline.svg',
					'images/icon/open-in-app.svg',
					'images/icon/share-variant.svg',
					'images/icon/settings.svg',
					'images/icon/download.svg',
					'lang/en-us.json'
				] );
			// These items must be cached for the Service Worker to complete installation
			return cache
				.addAll( [
					'scripts/glitcher.js',
					'scripts/workers/glitchworker.js',
					'scripts/workers/storageworker.js',
					'scripts/workers/settingsworker.js',
					'styles/glitcher.css'
				] );
		} );
}

function putInCache ( cacheName, request, response ) {
	caches
		.open( cacheName )
		.then( function ( cache ) {
			cache
				.keys()
				.then( function ( keys ) {
					cache.put( request, response );
				} )
		} );
}

function clearOldCaches () {
	return caches
		.keys()
		.then( function ( keys ) {
			// Remove caches whose name is no longer valid
			return Promise
				.all(
					keys
						.filter( filterInvalidKeys )
						.map( function ( key ) { return caches.delete( key ); } )
				);
		} );
}

function filterInvalidKeys ( key ) {
	return key.indexOf( version ) !== 0;
}

function installed ( event ) {
	event
		.waitUntil( updateStaticCache().then( function () {
			return self.skipWaiting();
		} ) );
}

function activated ( event ) {
	event
		.waitUntil( clearOldCaches().then( function () {
			return self.clients.claim();
		} ) );
}

function fetched ( event ) {
	var request = event.request;
	// For non-GET requests, try the network, do not fall back to cache.
	if ( request.method !== 'GET' ) {
		event.respondWith( fetch( request ) );
		return;
	}

	// For HTML requests, try the network first, fall back to the cache
	if ( request.headers.get( 'Accept' ).indexOf( 'text/html' ) !== -1 ) {
		event.respondWith(
			fetch( request )
				.then( function ( response ) {
					// NETWORK
					// Stash a copy of this page in the pages cache
					putInCache( pagesCacheName, request, response.clone() );
					return response;
				} )
				.catch( function () {
					// CACHE
					return caches
						.match( request )
						.then( function ( response ) {
							return response;
						} );
				} )
		);

		return;
	}

	// For non-HTML requests, look in the cache first, fall back to the network
	event.respondWith(
		caches
			.match( request )
			.then( function ( response ) {
				// CACHE
				return response || fetch( request )
					.then( function ( response ) {
						// NETWORK
						// If the request is for an image, stash a copy of this image in the images cache
						if ( request.headers.get( 'Accept' ).indexOf( 'image' ) !== -1 ) {
							putInCache( imagesCacheName, request, response.clone() );
						}

						return response;
					} );
			} )
	);
}

(function () {
	self.addEventListener( 'fetch', fetched );
	self.addEventListener( 'install', installed );
	self.addEventListener( 'activated', activated );
})();
