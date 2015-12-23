/*global define*/
define(
	[ 'util/browser', 'util/addpublishers' ],
	function ( browser, addPublishers ) {
		// the DragAndDropView handles the drag + drop events
		// over the workspace and passes the uploaded file
		function DragAndDropView ( el ) {
			if ( ! ( this instanceof DragAndDropView ) ) {
				return new DragAndDropView( el );
			}

			var self = this;
			var publishers = addPublishers( self, 'drop' );
			var isOver = false;

			if ( browser.test( 'draganddrop' ) ) {
				document.addEventListener( 'drop', dropped, false );
				document.addEventListener( 'dragover', dragHovered, false );
				document.addEventListener( 'dragleave', dragLeft, false );
			}

			function preventDefault ( event ) {
				event.preventDefault();
			}

			function dragHovered ( event ) {
				if ( ! isOver ) {
					el.classList.add( 'drag-over' );
					isOver = true;
				}

				preventDefault( event );
			}

			function dragLeft ( event ) {
				if ( isOver ) {
					el.classList.remove( 'drag-over' );
					isOver = false;
				}

				preventDefault( event );
			}

			function dropped ( event ) {
				preventDefault( event );
				
				if (
					event.dataTransfer &&
					event.dataTransfer.files &&
					event.dataTransfer.files[0]
				) {
					publishers.drop.dispatch( event.dataTransfer.files[0] );
				}
				
				el.classList.remove( 'drag-over' );
			}
		}

		return DragAndDropView;
	}
);