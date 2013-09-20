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

				signals['control-set'].add( setControlValues );
				signals['control-updated'].dispatch( values );
			}
		}

		function controlUpdated( element )
		{
			if ( element.target )
			{
				element = element.target;
			}

			updateValue( element.id, element.value );
			updateValueInUI( element.id, element.value );
		}

		function setControlValues( new_values )
		{
			var control;

			for ( var id in new_values )
			{
				control = document.getElementById( id );
				control.value = new_values[id];
				controlUpdated( control );
			}

			values = new_values;
			signals['control-updated'].dispatch( values );
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