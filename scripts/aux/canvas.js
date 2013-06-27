/*global define*/
define(
	function()
	{
		var update = false;

		function resize( canvas, size )
		{

			if ( canvas.width !== size.width )
			{
				canvas.width = size.width;
				update = true;
			}

			if ( canvas.height !== size.height )
			{
				canvas.height = size.height;
				update = true;
			}

			if ( update )
			{
				canvas.width = size.width;
				canvas.height = size.height;
			}

			update = false;
		}

		function clear( canvas, ctx )
		{
			ctx.clearRect( ctx, 0, 0, canvas.width, canvas.height );
		}

		return { resize: resize, clear: clear };
	}
);