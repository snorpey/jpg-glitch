/*global define*/
define(
	function()
	{
		// http://stackoverflow.com/a/2381862/229189
		function triggerEvent( node, event_name )
		{
			var doc;

			if ( node.ownerDocument )
			{
				doc = node.ownerDocument;
			}

			else if ( node.nodeType === 9 )
			{
				doc = node;
			}

			else
			{
				throw new Error('Invalid node passed to fireEvent: ' + node.id);
			}

			if ( node.fireEvent )
			{
				// IE-style
				var event = doc.createEventObject();

				event.synthetic = true;

				node.fireEvent( 'on' + event_name, event );
			}

			else if ( node.dispatchEvent )
			{
				var event_class = '';

				switch ( event_name )
				{
					case 'click':
					case 'mousedown':
					case 'mouseup':
						event_class = 'MouseEvents';
						break;

					case 'focus':
					case 'change':
					case 'blur':
					case 'select':
						event_class = 'HTMLEvents';
						break;

					default:
						throw 'triggerEvent: Couldn’t find an event class for event ' + event_name + '.';
						break;
				}

				var event = doc.createEvent( event_class );
				var bubbles = event_name == 'change' ? false : true;  
				
				event.initEvent( event_name, bubbles, true );

				event.synthetic = true;
				node.dispatchEvent( event );
			}
		}

		return triggerEvent;
	}
);