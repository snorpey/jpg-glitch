/*global define*/
define(
	function()
	{
		var values = { };
		var is_initialized = false;
		var signals;
		var controls;
		var is_ie = document.querySelector( 'html' ).classList.contains( 'somewhatokie' );

		function init( shared )
		{
			signals = shared.signals;

			if ( shared.feature['query-selector-all'] )
			{
				var wrapper = document.getElementById( 'controls' );
				controls = wrapper.querySelectorAll( '.control-input' );

				wrapper.className += ' is-active';

				for ( var i = 0; i < controls.length; i++ )
				{
					var control = controls[i];

					control.addEventListener( 'input', controlUpdated, false );

					if ( is_ie )
					{
						control.addEventListener( 'change', controlUpdated, false );
					}

					updateValue( getInputKey( control.id ), control.value );
					updateInput( getCorrespondingInput( control.id ), control.value );
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

			updateValue( getInputKey( element.id ), element.value );
			updateInput( getCorrespondingInput( element.id ), element.value );
		}

		function setControlValues( new_values )
		{
			var control;
			var updated_values = { };

			for ( var id in new_values )
			{
				control = getCorrespondingInput( id );
				control.value = new_values[id];
				controlUpdated( control );
				updated_values[ getInputKey( id ) ] = new_values[id];
			}

			values = updated_values;
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

		function updateInput( input, value )
		{
			if ( input.value !== value )
			{
				input.value = value;
			}
		}

		function getCorrespondingInput( id )
		{
			var result;
			var key = getInputKey( id );
			var element_id;

			for ( var i = 0, len = controls.length; i < len; i++ )
			{
				element_id = controls[i].id;

				if (
					element_id !== id &&
					element_id.indexOf( key ) !== -1
				)
				{
					result = controls[i];
					break;
				}
			}

			return result;
		}

		function getInputKey( id )
		{
			return id.replace( '-slider', '' ).replace( '-number', '' );
		}

		return { init: init };
	}
);