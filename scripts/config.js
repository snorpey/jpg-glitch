define(
	function () {
		return {
			keys: {
				// this is my api key
				// please get your own if you're hosting this app
				// on a different server.
				// https://api.imgur.com/oauth2/addclient
				// thank you.
				imgur:   'a4c24380d884932',
				storage: 'glitch-items'
			},
			defaultControlParams: {
				amount: {     min: 0, max: 99,  value: 24 },
				seed: {       min: 0, max: 100, value: 53 },
				iterations: { min: 0, max: 100, value: 21 },
				quality: {    min: 1, max: 99,  value: 46 }
			},
			defaultImage: {
				name: 'AbrahamLincoln',
				path: 'images/lincoln.jpg'
			},
			workers: {
				glitch:   'scripts/workers/glitchworker.js',
				storage:  'scripts/workers/storageworker.js',
				settings: 'scripts/workers/settingsworker.js'
			},
			language: {
				dir: 'lang',
				preset: 'en-us'
			},
			settings: {
				canZoomWithPointer: { value: true },
				resizeUploadedImages: { value: true },
				language: { value: 'en-us', options: [ 'en-us', 'de-de' ] }
			},
			localForage: {
				name      : 'glitchtool',
				storeName : 'keyvaluepairs'
			}
		};
	}
);