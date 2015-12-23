/*global define*/
define(
	[ 'util/addpublishers', 'util/el' ],
	function ( addPublishers, elHelper ) {
		// the controls for the workspace at the bottom of the screen
		// zoom range and center buttons
		function CanvasControlsView ( parentEl ) {
			if ( ! ( this instanceof CanvasControlsView ) ) {
				return new CanvasControlsView( parentEl );
			}

			var self = this;
			var publishers = addPublishers( self, 'update', 'center', 'scale' );
			var isIgnoringInput = false;
			var el = elHelper.createEl( 'div', 'workspace-controls clear', parentEl );

			elHelper.createButton( 'controls.center', 'controls.centertitle', 'center-button button', el, centerButtonClicked );
			elHelper.createButton( 'controls.original', 'controls.originaltitle', 'scale-to-original-button button', el, scaleToOriginalButtonClicked );
			elHelper.createLabel( 'controls.zoom', 'control.zoomtitle', 'scale-label', el );

			var scaleSliderEl = elHelper.createEl( 'input', 'scale-slider', el );
			scaleSliderEl.id = 'zoom'
			scaleSliderEl.type = 'range'
			scaleSliderEl.min = 0.01;
			scaleSliderEl.max = 5;
			scaleSliderEl.step = 0.001;
			scaleSliderEl.addEventListener( 'input', scaleSliderChanged );
			scaleSliderEl.addEventListener( 'change', scaleSliderChanged );

			function centerButtonClicked ( event ) {
				publishers.center.dispatch();
			}

			function scaleSliderChanged ( event ) {
				if ( ! isIgnoringInput ) {		
					publishers.scale.dispatch( parseFloat( scaleSliderEl.value ) );
					publishers.update.dispatch( 'scale', parseFloat( scaleSliderEl.value ) );
				}
			}

			function scaleToOriginalButtonClicked ( event ) {
				publishers.scale.dispatch( 1.00 );
				publishers.update.dispatch( 'scale', 1.00 );
			}

			// when setting scale, prevent infinite
			// loop by ignoring input element
			function setScale ( scale ) {
				isIgnoringInput = true;
				scaleSliderEl.value = scale;
				isIgnoringInput = false;

				return self;
			}

			function setValue ( key, value ) {
				if ( key === 'scale' ) {
					setScale( value );
				}

				return self;
			}

			self.setScale = setScale;
			self.setValue = setValue;
			self.el = el;
		}

		return CanvasControlsView;
	}
)