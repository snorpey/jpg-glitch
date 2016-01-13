/*global define*/
define(
	[ 'util/el', 'views/dialog', 'util/addpublishers', 'util/localizetext' ],
	function ( elHelper, Dialog, addPublishers, loc ) {
		function SettingsView ( parentEl ) {
			if ( ! ( this instanceof SettingsView ) ) {
				return new SettingsView ( parentEl );
			}

			var self = this;
			var publishers = addPublishers( self, 'settingchange' );
			
			var buttonEl = elHelper.createButton( 'settings.settings', 'settings.settingstitle', 'nav-button settings-button', parentEl );
			var dialog = Dialog( 'settings-dialog', parentEl, buttonEl );
			var animationFrameIds = { };

			function addSetting ( name, value, options ) {
				if ( ! dialog.el.querySelector( '#setting-' + name ) ) {
					if ( name === 'language' ) {
						dialog.add( 'is-online-only', makeSettingEl( name, value, options ) );
					} else {
						dialog.add( makeSettingEl( name, value, options ) );
					}
				}
			}

			function makeSettingEl ( name, value, options ) {
				var wrapperEl = elHelper.createEl( 'div', 'setting' );
				var labelEl = elHelper.createLabel( 'settings.' + name.toLowerCase(), 'setting-' + name, 'setting-label', wrapperEl );
				var inputEl;

				if ( options ) {
					if ( Array.isArray( options ) ) {
						inputEl = elHelper.createEl( 'select', 'setting-input setting-select', wrapperEl );

						var optionEl;

						options.forEach( function ( option ) {
							optionEl = elHelper.createEl( 'option', null, inputEl );
							optionEl.value = option;
							
							loc( optionEl, 'textContent', 'settings.' + name + 'options.' + option );
							
							if ( option === value ) {
								optionEl.selected = true
							}
						} );
					}
				} else {
					if ( typeof value === 'boolean' ) {
						inputEl = elHelper.createEl( 'input', 'setting-input setting-checkbox', wrapperEl );
						inputEl.type = 'checkbox';

						if ( value === true ) {
							inputEl.checked = true;
						}
					}
				}

				if ( inputEl ) {
					inputEl.id = 'setting-' + name;
					inputEl.setAttribute( 'data-setting', name );
					inputEl.addEventListener( 'change', settingInputChanged );
				}

				return wrapperEl;
			}

			function settingInputChanged ( event ) {
				var target = event.target;

				if ( event.target.classList.contains( 'setting-input' ) ) {
					var inputEl = event.target;
					var settingName = inputEl.getAttribute( 'data-setting' );
					var inputValue;

					if ( inputEl.classList.contains( 'setting-checkbox' ) ) {
						inputValue = inputEl.checked;
					} else {
						if ( inputEl.classList.contains( 'setting-select' ) ) {
							inputValue = inputEl.value;
						}
					}

					if ( typeof inputValue !== 'undefined' ) {						
						publishers.settingchange.dispatch( settingName, inputValue );
					}
 				}
			}

			function settingUpdated ( name, value, options ) {
				cancelAnimationFrame( animationFrameIds[name] );
				animationFrameIds[name] = requestAnimationFrame( function () {
					addSetting( name, value, options );

					var inputEl = dialog.el.querySelector( '.setting-checkbox[data-setting="' + name + '"]' );

					if ( inputEl ) {
						if ( inputEl.classList.contains( 'setting-checkbox' ) && inputEl.checked !== value ) {
							inputEl.checked = value;
						}

						if ( inputEl.classList.contains( 'setting-select' ) && inputEl.value !== value ) {
							var optionsEls = inputEl.querySelector( 'option' );
							var optionEl;
							var optionValue;
							
							for ( var i = 0, len = optionsEls.length; i < len; i++ ) {
								optionEl = optionsEls[i];
								optionValue = optionEl.value;

								if ( optionValue === value && ! optionEl.selected ) {
									optionEl.selected = true;
								}

								if ( optionValue !== value && optionEl.selected ) {
									optionEl.selected = false;
								}
							}
						}
					}
				} );
			}

			self.settingUpdated = settingUpdated;
		}

		return SettingsView;
	}
);