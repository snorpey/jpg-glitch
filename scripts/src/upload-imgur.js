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
		var twitter_link;
		var facebook_link;
		var reddit_link;
		var is_uploading = false;
		var is_showing_links = false;

		function init( shared )
		{
			signals = shared.signals;
			imgur_button = document.getElementById( 'imgur-button' );
			imgur_url_container = document.getElementById( 'imgur-url-container' );
			imgur_url_input = document.getElementById( 'imgur-url-input' );
			imgur_url_link = document.getElementById( 'imgur-url-link' );
			imgur_url_error = document.getElementById( 'imgur-url-error' );
			twitter_link = document.getElementById( 'twitter-link' );
			facebook_link = document.getElementById( 'facebook-link' );
			reddit_link = document.getElementById( 'reddit-link' );

			imgur_button.addEventListener( 'click', buttonClicked, false );
			imgur_url_input.addEventListener( 'click', selectInput, false );

			signals['control-updated'].add( controlsUpdated );
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
				var twitter_share_url_text = "Check out what I made with @snorpey’s glitch tool: ";
				twitter_share_url_text += response.data.link;
				twitter_share_url_text += ' http://snorpey.github.io/jpg-glitch';

				//http://ar.zu.my/how-to-really-customize-the-deprecated-facebook-sharer-dot-php/
				var facebook_share_url = 'https://www.facebook.com/sharer/sharer.php?s=100';
				facebook_share_url += '&p[url]=' + response.data.link;
				facebook_share_url += '&p[title]=Glitch!';
				facebook_share_url += '&p[images][0]=' + response.data.link;
				facebook_share_url += '&p[summary]=' + encodeURIComponent( 'Check out what I made with this glitch tool: http://snorpey.github.io/jpg-glitch' );

				imgur_button.classList.remove( 'is-uploading' );
				imgur_url_input.setAttribute( 'value', response.data.link );
				imgur_url_link.href = response.data.link;
				imgur_url_container.classList.add( 'is-active', 'upload-successful' );

				twitter_link.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent( twitter_share_url_text );
				facebook_link.href = facebook_share_url;
				reddit_link.href = 'https://www.reddit.com/submit?url=' + encodeURIComponent( response.data.link ) + '&title=Glitch!';

				is_showing_links = true;
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

		function controlsUpdated()
		{
			if ( is_showing_links )
			{
				imgur_url_container.classList.remove( 'is-active' );
				imgur_url_container.classList.remove( 'upload-failed' );
				imgur_url_container.classList.remove( 'upload-successful' );
				imgur_button.classList.remove( 'is-uploading' );

				is_showing_links = false;
			}
		}

		return { init: init };
	}
);