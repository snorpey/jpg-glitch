/*global define*/
define(
	[ 'util/addpublishers' ],
	function ( addPublishers ) {
		// the workspaceView is just a wrapper for the
		// panZoom and the workspaceNav elements
		function WorkspaceView ( parentEl ) {
			if ( ! ( this instanceof WorkspaceView ) ) {
				return new WorkspaceView( parentEl );
			}

			var self = this;
			var publishers = addPublishers( self, 'click' );
			
			var el = document.createElement( 'div' );
			el.classList.add( 'workspace' );
			parentEl.appendChild( el );

			el.addEventListener( 'click', publishers.click.dispatch, true );

			self.el = el;
		}

		return WorkspaceView;
	}
)