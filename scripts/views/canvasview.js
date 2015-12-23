/*global define*/
define(
	[ 'util/addpublishers', 'util/el', 'views/panzoom' ],
	function ( addPublishers, elHelper, PanZoom ) {
		// canvasview: a wrapper for the PanZoom workspace element
		function CanvasView ( parentEl, buttonParentEl ) {
			if ( ! ( this instanceof CanvasView ) ) {
				return new CanvasView( parentEl, buttonParentEl );
			}

			var self = this;
			var publishers = addPublishers( self, 'update', 'imagesizechange', 'scale', 'dblclick' );
			var imageSize = { width: 0, height: 0 };
			
			var workspaceEl = elHelper.createEl( 'div', 'panzoom', parentEl );
			var canvasWrapperEl = elHelper.createEl( 'div', 'canvas-wrapper', workspaceEl );
			var canvasEl = elHelper.createEl( 'canvas', 'glitch-canvas', canvasWrapperEl );

			var ctx = canvasEl.getContext( '2d' );

			var panZoom = PanZoom( canvasWrapperEl, workspaceEl )
				.on( 'scale', function ( scale ) {
					publishers.scale.dispatch( scale );
					publishers.update.dispatch( 'scale', scale );
				} );

			var hideShowTimeoutId = NaN;
			var lastClickTime = Date.now();

			workspaceEl.addEventListener( 'dblclick', workspaceDoubleClicked );

			function workspaceDoubleClicked ( event ) {
				publishers.dblclick.dispatch();
			}

			function putImageData ( imageData ) {
				canvasWrapperEl.style.width = imageData.width + 'px';
				canvasWrapperEl.style.height = imageData.height + 'px';
				
				if ( imageSize.width !== imageData.width || imageSize.height !== imageData.height ) {
					canvasEl.width = imageData.width;
					canvasEl.height = imageData.height;
					imageSize.width = imageData.width;
					imageSize.height = imageData.height;
					panZoom.animateToCenter();
					publishers.imagesizechange.dispatch();
				}

				ctx.putImageData( imageData, 0, 0 );
				panZoom.updateContainerBounds();
			}

			function createImageUrl ( callback ) {
				return function () {
					callback( canvasEl.toDataURL( 'image/jpeg', 100 ) );
				}
			}
			
			function hide () {
				clearTimeout( hideShowTimeoutId );
				workspaceEl.classList.remove( 'is-visible' );
			}

			function show () {
				clearTimeout( hideShowTimeoutId );
				
				hideShowTimeoutId = setTimeout( function () {
					workspaceEl.classList.add( 'is-visible' );
				}, 400 );
			}

			self.putImageData = putImageData;
			self.moveToCenter = panZoom.moveToCenter;
			self.animateToCenter = panZoom.animateToCenter;
			self.setScale = panZoom.setScale;
			self.createImageUrl = createImageUrl;
			self.hide = hide;
			self.show = show;
			self.resized = panZoom.resized;
			self.el = workspaceEl;
			self.panZoom = panZoom;
		}

		return CanvasView;
	}
);