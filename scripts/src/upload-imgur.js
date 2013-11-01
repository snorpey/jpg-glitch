/*global define*/
define(
	[ 'lib/reqwest' ],
	function( reqwest, $ )
	{
		var signals;
		var imgur_button;
		var imgur_url_container;
		var imgur_url_input;
		var imgur_url_link;
		var imgur_url_error;
		var is_uploading = false;

		function init( shared )
		{
			signals = shared.signals;
			imgur_button = document.getElementById( 'imgur-button' );
			imgur_url_container = document.getElementById( 'imgur-url-container' );
			imgur_url_input = document.getElementById( 'imgur-url-input' );
			imgur_url_link = document.getElementById( 'imgur-url-link' );
			imgur_url_error = document.getElementById( 'imgur-url-error' );

			imgur_button.addEventListener( 'click', buttonClicked, false );
			imgur_url_input.addEventListener( 'click', selectInput, false );
		}

		function buttonClicked( event )
		{
			event.preventDefault();

			if ( ! is_uploading )
			{
				signals['image-data-url-requested'].dispatch( upload );

				imgur_url_container.classList.remove( 'is-active', 'upload-failed', 'upload-successful' );
			}
		}

		function selectInput()
		{
			imgur_url_input.select();
		}

		//http://stackoverflow.com/questions/17805456/upload-a-canvas-image-to-imgur-api-v3-with-javascript
		function upload( data_url )
		{
			if ( ! is_uploading )
			{
				imgur_button.classList.add( 'is-uploading' );

				is_uploading = true;
				
				reqwest(
					{
						url: 'https://api.imgur.com/3/image.json',
						method: 'POST',
						headers: {
							Authorization: 'Client-ID a4c24380d884932'
						},
						data: {
							image: data_url.split( ',' )[1],
							type: 'base64'
						},
						type: 'json',
						crossOrigin: true,
						success: imageUploaded,
						error: uploadFailed
					}
				);
			}
		}

		function imageUploaded( response )
		{
			is_uploading = false;
			
			if ( response && response.data && response.data.link )
			{
				imgur_button.classList.remove( 'is-uploading' );
				imgur_url_input.setAttribute( 'value', response.data.link );
				imgur_url_link.href = response.data.link;
				imgur_url_container.classList.add( 'is-active', 'upload-successful' );
			}
			
			else
			{
				uploadFailed();
			}
		}

		function uploadFailed( response )
		{
			is_uploading = false;
			imgur_button.classList.remove( 'is-uploading' );
			imgur_url_container.classList.add( 'is-active', 'upload-failed' );
		}

		return { init: init };
	}
);