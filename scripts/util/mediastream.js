/*global define*/
define(
	function () {
		// http://stackoverflow.com/a/11646945
		var MediaStream = window.MediaStream;

		if ( typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined' ) {
			MediaStream = webkitMediaStream;
		}

		/*global MediaStream:true */
		if ( typeof MediaStream !== 'undefined' && !( 'stop' in MediaStream.prototype ) ) {
			MediaStream.prototype.stop = function () {
				this.getAudioTracks().forEach( function ( track ) {
					track.stop();
				} );

				this.getVideoTracks().forEach( function ( track ) {
					track.stop();
				} );
			};
		}
	}
)