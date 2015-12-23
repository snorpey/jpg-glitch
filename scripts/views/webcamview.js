/*global define*/
define(
	[ 'util/browser', 'util/addpublishers', 'util/el', 'util/dom', 'views/dialog', 'util/mediastream' ],
	function ( browser, addPublishers, elHelper, domHelper, Dialog ) {
		// Webcamview: allows to take a picture with the web cam (if supported by the browser)
		function WebcamView ( parentEl ) {
			if ( ! ( this instanceof WebcamView ) ) {
				return new WebcamView( parentEl );
			}

			var self = this;
			var isRecording = false;
			var photoUIEl;
			var videoEl;
			var getUserMedia;
			var stream;

			var camOptions = {
				video: true
			};

			var urlLib;
			var publishers = addPublishers( self, 'video', 'error' );
			var dialog;

			if ( browser.test( 'getusermedia' ) ) {
				var toggleButtonEl = elHelper.createButton( 'webcam.webcam', 'webcam.webcamtitle', 'nav-button photo-button', parentEl );
				var labelEl = elHelper.createLabel( 'webcam.webcamlabel', null, 'webcam-label label' );
				var videoWrapperEl = elHelper.createEl( 'div', 'video-wrapper' );

				var videoEl = document.createElement( 'video' );
				videoEl.classList.add( 'cam-video' );
				videoEl.controls = false;
				domHelper.setTransform( videoEl, 'scale(-1, 1)' );
				videoEl.addEventListener( 'click', captureClicked );
				videoWrapperEl.appendChild( videoEl );
				
				var triggerButtonEl = elHelper.createButton( 'webcam.trigger', 'webcam.triggertitle', 'cam-trigger-button button', null, captureClicked );

				dialog = Dialog( 'webcam-dialog', parentEl, toggleButtonEl )
					.add( labelEl, videoWrapperEl, triggerButtonEl )
					.on( 'show', startVideo )
					.on( 'hide', closeVideo );
			}

			function startVideo ( event ) {
				if ( ! isRecording ) {
					navigator.getUserMedia( camOptions, gotCamStream, userMediaFailed );
				}
			}

			function captureClicked ( event ) {
				videoWrapperEl.classList.add( 'is-taking-picture' );

				setTimeout( function () {
					publishers.video.dispatch( videoEl );
					videoWrapperEl.classList.remove( 'is-taking-picture' );
				}, 50 );
			}

			function gotCamStream ( videoStream ) {
				var itWorked = true;

				if ( videoEl.mozSrcObject !== undefined ) {
					videoEl.mozSrcObject = videoStream;
				} else {
					if ( window.URL ) {
						videoEl.src = window.URL.createObjectURL( videoStream );
					} else {
						itWorked = false;
					}
				}

				if ( itWorked ) {
					dialog.show();
					videoEl.play();
					updateVideoSize();
					
					isRecording = true;
					stream = videoStream;
				} else {
					dialog.hide();
					publishers.error.dispatch( 'webcam.error.access' );
				}
			}

			function userMediaFailed () {
				if ( stream ) {
					stopStream();
					publishers.error.dispatch( 'webcam.error.access' );
				}
			}

			function closeVideo () {
				dialog.hide();
				stopStream();
			}

			function stopStream () {
				if ( stream ) {
					videoEl.pause();

					if ( videoEl.mozSrcObject ) {
						videoEl.mozSrcObject = null;
					}

					if ( videoEl.src ) {
						videoEl.src = null;
						videoEl.src = '';
					}
					
					if ( stream.stop ) {
						stream.stop();
					}
					
					stream = null;
					isRecording = false;
				}
			}
			
			function updateVideoSize () {
				if ( videoEl.videoHeight > 0 ) {
					videoEl.width = videoEl.videoWidth;
					videoEl.height = videoEl.videoHeight;
				} else {
					setTimeout( updateVideoSize, 100 );
				}
			}
		}

		return WebcamView;
	}	
);