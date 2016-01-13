/*global define*/
define(
	[ 'util/addpublishers', 'util/el', 'util/localizetext' ],
	function ( addPublishers, elHelper, loc ) {
		// the control elements are used to change the appearance of the image
		function ControlsView ( parentEl, buttonParentEl, params ) {
			if ( ! ( this instanceof ControlsView ) ) {
				return new ControlsView( parentEl, buttonParentEl, params );
			}

			params = params || { };

			var self = this;
			var publishers = addPublishers( self, 'update', 'random' );

			var isIgnoringInput = false;
			var isActive = true;
			var activeTimeoutId = 0;

			var inputEls = { };
			var valueEls = { };

			var controlsEl = elHelper.createEl( 'div', 'controls', parentEl );
			var controlsWrapperEl = elHelper.createEl( 'div', 'controls-wrapper', controlsEl );
			var buttonEl = elHelper.createButton( 'controls.controls', 'controls.controlstitle', 'controls-toggle-button button is-active', buttonParentEl, toggleControls );
			
			for ( var key in params ) {
				addControl( key, params[key] );
			}

			show();
			
			elHelper.createButton( 'controls.randomize', 'controls.randomizetitle', 'random-button button', controlsWrapperEl, randomButtonClicked );

			function loadInitialValues () {
				// dispatch initial values when model is listening
				var controlValues = getInputValues();
				
				for ( var key in controlValues ) {
					publishers.update.dispatch( key, controlValues[key] );
				}
			}

			function addControl ( key, params ) {
				var controlEl = elHelper.createEl( 'div', 'control', controlsWrapperEl );
				
				var labelEl = elHelper.createLabel( 'controls.' + key, 'input-' + key, 'control-label', controlEl );
				loc( labelEl, 'title', 'controls.' + key );
				
				var inputEl = elHelper.createEl( 'input', 'control-input', controlEl );
				inputEl.setAttribute( 'data-key', key );
				inputEl.setAttribute( 'id', 'input-' + key );
				inputEl.type = 'range';
				inputEl.value = params.value || 0;
				inputEl.min = params.min || 0;
				inputEl.max = params.max || 100;
				inputEl.addEventListener( 'input', inputUpdated );
				inputEl.addEventListener( 'change', inputUpdated );
				
				inputEls[key] = inputEl;

				var valueEl = elHelper.createEl( 'input', 'control-value', controlEl );
				valueEl.setAttribute( 'data-key', key );
				valueEl.type = 'number';
				valueEl.value = params.value || 0;
				valueEl.min = params.min || 0;
				valueEl.max = params.max || 100;
				valueEl.addEventListener( 'input', inputUpdated );
				valueEl.addEventListener( 'change', inputUpdated );

				valueEls[key] = valueEl;

				inputUpdated( { target: inputEl } );
			}
	
			function inputUpdated ( event ) {
				if ( isActive && ! isIgnoringInput ) {
					var key = event.target.getAttribute( 'data-key' );
					var controlValues = getInputValues();

					if ( controlValues[key] !== event.target.value ) {
						controlValues[key] = parseInt( event.target.value, 10 );
						
						publishers.update.dispatch( key, controlValues[key] );
					}
				}
			}

			function randomButtonClicked ( event ) {
				if ( isActive ) {
					publishers.random.dispatch();
				}
			}

			function toggleControls () {
				if ( isActive ) {
					hide();
				} else {
					show();
				}
			}

			function hide () {
				controlsEl.classList.remove( 'is-active' );
				buttonEl.classList.remove( 'is-active' );
				buttonParentEl.classList.remove( 'controls-enabled' );
				isActive = false;

				clearTimeout( activeTimeoutId );

				activeTimeoutId = setTimeout( function () {
					controlsEl.classList.remove( 'is-visible' );
				}, 500 );
			}

			function show () {
				controlsEl.classList.add( 'is-visible' );
				isActive = true;
				
				clearTimeout( activeTimeoutId );

				activeTimeoutId = setTimeout( function () {
					controlsEl.classList.add( 'is-active' );
					buttonEl.classList.add( 'is-active' );
					buttonParentEl.classList.add( 'controls-enabled' );
				}, 10 );
			}

			function getInputValues () {
				var result = { };

				for ( var key in inputEls ) {
					result[key] = parseInt( inputEls[key].value, 10 );
				}

				return result;
			}

			// when setting a value, prevent dispatching
			// of elements to avoid an infinite loop of
			// input events
			function setValue ( key, newValue ) {
				isIgnoringInput = true;

				inputEls[key].value = newValue;
				valueEls[key].value = newValue;

				isIgnoringInput = false;
			}
			
			self.loadInitialValues = loadInitialValues;
			self.setValue = setValue;
		}

		return ControlsView;
	}
);