/*global define*/
define(
	[ 'util/object', 'util/addpublishers' ],
	function ( objectHelper, addPublishers ) {
		// the controlsmodel stores and manages all
		// values of the input sliders
		function ControlsModel ( initialValues ) {
			if ( ! ( this instanceof ControlsModel ) ) {
				return new ControlsModel( initialValues );
			}

			var self = this;
			var publishers = addPublishers( self, [ 'update' ] );
			var limits = getLimits( initialValues ) || { };
			var values = getValues( initialValues ) || { };

			function updateValues ( newValues ) {
				if ( newValues ) {
					newValues = objectHelper.getCopy( newValues );

					var referenceValue;
					var newValue;
					
					for ( var key in newValues ) {
						limit = limits[key];
						newValue = newValues[key];

						if (
							typeof limit !== 'undefined' &&
							typeof newValue === 'number' &&
							! isNaN( newValue ) &&
							newValue >= limit.min &&
							newValue <= limit.max &&
							values[key] !== newValue
						) {
							values[key] = newValue;
							publishers.update.dispatch( key, values[key] );
						}
					}
				}

				return self;
			}

			function setValue ( key, newValue ) {
				if (
					typeof values[key] === 'number' &&
					typeof newValue === 'number' &&
					! isNaN( newValue )
				) {
					values[key] = newValue;

					publishers.update.dispatch( key, values[key] );
				}

				return self;
			}

			function randomizeValues () {
				var randomValues = { };

				for ( var key in limits ) {
					randomValues[key] = parseInt(
						Math.random() * ( limits[key].max - limits[key].min ) + limits[key].min,
						10
					);
				}

				updateValues( randomValues );

				return self;
			}

			function getValues ( vals ) {
				var result = { };
				vals = vals || values;

				for ( var key in vals ) {
					if ( typeof vals[key].value === 'number' ) {
						result[key] = vals[key].value;
					} else {
						result[key] = vals[key];
					}
				}

				return objectHelper.getCopy( result );
			}

			function getLimits ( vals ) {
				var result = { };
				
				for ( var key in vals ) {
					result[key] = {
						min: vals[key].min,
						max: vals[key].max
					};
				}

				return objectHelper.getCopy( result );
			}

			self.randomizeValues = randomizeValues;
			self.setValue = setValue;
			self.getValues = getValues;
		}

		return ControlsModel;
	}
);