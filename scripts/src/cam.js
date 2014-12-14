/*global define*/
define(
	[ 'lib/getusermedia' ],
	function ()
	{
		var cam_button_el = document.getElementById( 'cam-button' );
		var video_wrapper_el;
		var video_el;
		var stream;

		var canvas_el;
		var ctx;

		var signals;

		function init ( shared ) {

			signals = shared.signals;

			if ( navigator.getUserMedia ) {
				cam_button_el.classList.add( 'is-supported' );
				cam_button_el.addEventListener( 'click', camButtonClicked );

				video_wrapper_el = document.createElement( 'div' );
				video_wrapper_el.classList.add( 'cam-wrapper' );

				var take_picture_el = document.createElement( 'div' );
				take_picture_el.textContent = 'Take Picture';
				take_picture_el.classList.add( 'take-picture' );
				take_picture_el.classList.add( 'button' );
				take_picture_el.addEventListener( 'click', videoClicked );

				video_wrapper_el.appendChild( take_picture_el );

				video_el = document.createElement( 'video' );
				video_el.classList.add( 'cam' );

				video_el.addEventListener( 'click', videoClicked );
				video_wrapper_el.appendChild( video_el );

				document.body.appendChild( video_wrapper_el );
				
				canvas_el = document.createElement( 'canvas' );
			}
		}

		function camButtonClicked ( event ) {
			var cam_options = { video: true };

			navigator.getUserMedia( cam_options, gotCamData, failed );
		}

		function gotCamData ( media_stream ) {
			var source;

			if ( window.webkitURL )
			{
				source = window.URL.createObjectURL( media_stream );
			}

			else
			{
				source = media_stream;
			}

			if ( video_el.mozSrcObject !== undefined )
			{
				video_el.mozSrcObject = source;
			}

			else
			{
				video_el.src = source;
			}

			stream = media_stream;

			video_el.play();
			video_el.style.display = 'block';

			video_wrapper_el.classList.add( 'is-active' );

			

			canvas_el.width = 640;
			canvas_el.height = 480;
			ctx = canvas_el.getContext( '2d' );
		}

		function failed () {
			console.log( 'sorry, but there was an error accessing you camera...' );
		}

		function videoClicked ( event ) {
			ctx.translate( canvas_el.width, 0 );
			ctx.scale( -1, 1 );
			ctx.drawImage( video_el, 0, 0 );

			var data = ctx.getImageData( 0, 0, canvas_el.width, canvas_el.height );
			var image_src = canvas_el.toDataURL( 'image/png' );

			video_wrapper_el.classList.remove( 'is-active' );

			signals['set-new-src'].dispatch( image_src );

			setTimeout( function() { stream.stop(); }, 500 );
		}

		return {
			init: init
		};
	}
);