/*global define*/
define(
	function()
	{
		var values = { };
		var is_initialized = false;
		var signals;

		function init( shared )
		{
			signals = shared.signals;

			if ( shared.feature['query-selector-all'] )
			{
				var wrapper = document.getElementById( 'controls' );
				var controls = document.querySelectorAll( '.control-input' );

				wrapper.className += ' is-active';

				for ( var i = 0; i < controls.length; i++ )
				{
					var control = controls[i];

					control.addEventListener( 'change', controlUpdated, false );
					updateValue( control.id, control.value );
					updateValueInUI( control.id, control.value );
				}

				is_initialized = true;

				signals['control-updated'].dispatch( values );
			}
		}

		function controlUpdated( event )
		{
			var target = event.target;

			updateValue( target.id, target.value );
			updateValueInUI( target.id, target.value );
		}

		function updateValue( key, value )
		{
			values[key] = value;

			if ( is_initialized )
			{
				signals['control-updated'].dispatch( values );
			}
		}

		function updateValueInUI( key, value )
		{
			var el = document.querySelectorAll( 'label[for="' + key  + '"] .control-slider-value' )[0];
			el.innerHTML = value;
		}

		return { init: init };
	}
);