/*global define*/
define(
	function()
	{
		var tests = {
			'canvas': { required: true, test: function(){ return !! document.createElement('canvas').getContext; } },
			'query-selector-all': { required: false, test: function(){ return !! document.querySelectorAll; } },
			'drag-drop': { required: false, test: function(){ return 'draggable' in document.createElement('span'); } },
			'file-api': { required: false, test: function(){ return typeof FileReader !== 'undefined'; } }
		};

		function test( success, error )
		{
			var required_supported = true;
			var results = { };
			var required_features_missing = [ ];

			for ( var key in tests )
			{
				var result = tests[key].test();

				if ( ! result )
				{
					if ( tests[key].required )
					{
						required_supported = false;

						required_features_missing.push( key );
					}
				}

				results[key] = result;
			}

			if ( required_supported )
			{
				success( results );
			}

			else
			{
				error( required_features_missing, results );
			}
		}

		return test;
	}
);