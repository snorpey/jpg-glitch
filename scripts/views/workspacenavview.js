/*global define*/
define(
	[ 'util/el' ], 
	function ( elHelper ) {
		// a container for the workespace nav items
		function WorkspaceNavView ( parentEl ) {
			if ( ! ( this instanceof WorkspaceNavView ) ) {
				return new WorkspaceNavView( parentEl );
			}

			var self = this;
			var el = elHelper.createEl( 'nav', 'workspace-nav', parentEl );

			self.el = el;
		}

		return WorkspaceNavView;
	}
);