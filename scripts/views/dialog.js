/*global define*/
define(
	[ 'util/el', 'util/dom', 'util/addpublishers' ],
	function ( elHelper, domHelper, addPublishers ) {

		var dialogInstances = [ ];

		function closeOpenDialogInstances () {
			dialogInstances.forEach( function ( instance ) {
				instance.hide();
			} );
		}

		function Dialog ( cssClassName, parentEl, toggleEl ) {
			if ( ! ( this instanceof Dialog ) ) {
				return new Dialog( cssClassName, parentEl, toggleEl );
			}

			var self = this;
			var publishers = addPublishers( self, 'hide show' );
			var isActive = false;
			var animationTimeoutId = NaN;
			var hasToggleEl = false;

			var dialogEl = elHelper.createEl( 'div', 'dialog color-bg-light ' + cssClassName, parentEl );

			if ( toggleEl && domHelper.isElement( toggleEl ) ) {
				hasToggleEl = true;
				toggleEl.addEventListener( 'click', toggle );
			}
									
			function show () {
				if ( ! isActive ) {
					closeOpenDialogInstances();
					dialogEl.classList.add( 'is-visible' );
					isActive = true;
					publishers.show.dispatch();

					clearTimeout( animationTimeoutId );
					
					animationTimeoutId = setTimeout( function () {
						dialogEl.classList.add( 'is-active' );

						if ( hasToggleEl ) {
							toggleEl.classList.add( 'is-active' );
						}
					}, 10 );
				}

				return self;
			}

			function hide () {
				if ( isActive ) {
					dialogEl.classList.remove( 'is-active' );
					isActive = false;
					publishers.hide.dispatch();

					if ( hasToggleEl ) {
						toggleEl.classList.remove( 'is-active' );
					}

					clearTimeout( animationTimeoutId );

					animationTimeoutId = setTimeout( function () {
						dialogEl.classList.remove( 'is-visible' );
					}, 500 );
				}

				return self;
			}

			function toggle () {
				if ( isActive ) {
					hide();
				} else {
					show();
				}

				return self;
			}

			function add () {
				var wrapperEl = document.createElement( 'div' );
				wrapperEl.classList.add( 'dialog-item' );
				dialogEl.appendChild( wrapperEl );

				for ( var i = 0, len = arguments.length; i < len; i++ ) {
					if ( typeof arguments[i] === 'string' ) {
						arguments[i].split( ' ' ).forEach( function ( cssClassName ) {
							wrapperEl.classList.add( cssClassName );
						} );
					} else {
						arguments[i].wrapperEl = wrapperEl;
						wrapperEl.appendChild( arguments[i] );
					}
				}

				return self;
			}

			function remove ( el ) {
				el.parentNode.parentNode.removeChild( el.parentNode );
				return self;
			}

			self.add = add;
			self.remove = remove;
			self.show = show;
			self.hide = hide;
			self.toggle = toggle;
			self.el = dialogEl;

			dialogInstances.push( self );
		}
		
		Dialog.closeAll = closeOpenDialogInstances;

		return Dialog;
	}
);