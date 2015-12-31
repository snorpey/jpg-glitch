/*global define*/
define(
	[ 'util/dom', 'util/localizetext' ],
	function ( domHelper, loc ) {
		var svgEls = [ 'g', 'svg', 'rect' ];
		var svgNameSpace = 'http://www.w3.org/2000/svg';

		function createEl ( elementStr, cssClasses, parentEl ) {
			var hasNameSpace = svgEls.indexOf( elementStr ) !== -1;
			var el = hasNameSpace ? document.createElementNS( svgNameSpace, elementStr ) : document.createElement( elementStr );

			if ( hasNameSpace ) {
				document.createElementNS( 'http://www.w3.org/2000/svg', 'rect' );
			}

			cssClasses = typeof cssClasses === 'string' ? [ ].concat( cssClasses.split( ' ' ) ) : cssClasses;

			if ( Array.isArray( cssClasses ) ) {
				cssClasses.forEach( function ( cssClass ) {
					el.classList.add( cssClass );
				} );
			}

			if ( parentEl && parentEl.appendChild ) {
				parentEl.appendChild( el );
			}

			return el;
		}

		function createButton ( content, title, cssClasses, parentEl, onClick ) {
			var btnEl = createEl( 'button', cssClasses, parentEl );

			if ( typeof content === 'string' ) {
				// btnEl.textContent = content;
				loc( btnEl, 'textContent', content );
			} else {
				if ( domHelper.isElement( content ) ) {
					btnEl.appendChild( content );
				}
			}

			// btnEl.title = title;
			loc( btnEl, 'title', title );

			if ( typeof onClick === 'function' ) {
				btnEl.addEventListener( 'click', onClick );
			}

			return btnEl;
		}

		function createLink ( content, title, href, target, cssClasses, parentEl ) {
			var linkEl = createEl( 'a', cssClasses, parentEl );

			if ( typeof content === 'string' ) {
				// linkEl.textContent = content;
				loc( linkEl, 'textContent', content );
			} else {
				if ( domHelper.isElement( content ) ) {
					linkEl.appendChild( content );
				}
			}

			if ( title ) {
				// linkEl.title = title;
				loc( linkEl, 'title', title );
			}
			
			if ( href ) {
				linkEl.href = href;
			}

			if ( target ) {
				linkEl.target = target;
			}

			return linkEl;
		}

		function createLabel ( content, forId, cssClasses, parentEl ) {
			var labelEl = createEl( 'label', cssClasses, parentEl );

			if ( typeof content === 'string' ) {
				// labelEl.textContent = content;
				loc( labelEl, 'textContent', content );
			} else {
				if ( domHelper.isElement( content ) ) {
					labelEl.appendChild( content );
				}
			}

			if ( forId ) {
				labelEl.setAttribute( 'for', forId );
			}

			return labelEl;
		}

		return {
			createEl: createEl,
			createButton: createButton,
			createLink: createLink,
			createLabel: createLabel
		}
	}
);