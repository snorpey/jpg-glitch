/*global define*/
define(
	function()
	{
		var signals;
		var is_open = true;
		var element = document.querySelectorAll( '.intro' )[0];
		var button = document.querySelectorAll( '.intro-button' )[0];
		var close_button = element.querySelectorAll( '.close' )[0];

		function init( shared )
		{
			signals = shared.signals;
			button.addEventListener( 'click', buttonClicked );
			close_button.addEventListener( 'click', close );
			signals['close-intro'].add( close );
		}

		function buttonClicked( event )
		{
			if ( is_open )
			{
				close();
			}

			else
			{
				open();
			}
		}

		function open()
		{
			button.classList.add( 'is-active' );
			element.classList.add( 'is-active' );
			element.style.top = '0';
			is_open = true;
		}

		function close()
		{
			button.classList.remove( 'is-active' );
			element.classList.remove( 'is-active' );
			element.style.top = -getHeight() + 'px';
			is_open = false;
		}

		function getHeight()
		{
			return element.clientHeight;
		}

		return { init: init };
	}
);