/*global define*/
define(
	[ 'models/localisationmodel' ],
	function ( LocalisationModel ) {
		function loc () {
			return LocalisationModel.sharedInstance.localizeText.apply( LocalisationModel.sharedInstance, arguments );
		}

		return loc;
	}
);