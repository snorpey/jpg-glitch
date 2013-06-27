/*global define*/
define(
	function()
	{
		var signals;
		var save_button;

		function init( shared )
		{
			signals = shared.signals;
			save_button = document.getElementById( 'save-button' );

			save_button.addEventListener( 'click', buttonClicked, false );
		}

		function buttonClicked( event )
		{
			event.preventDefault();

			signals['saved'].dispatch();
		}

		return { init: init };
	}
);