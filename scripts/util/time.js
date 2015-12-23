/*global define*/
define(
	function () {
		var lang = navigator.language || navigator.userLanguage || 'en-us';
		var intlIsSupported = !! window.Intl;

		function dateToStr ( date ) {
			return date.toISOString();
		}

		function timestampToDate ( str ) {
			return new Date( parseInt( str, 10 ) );
		}

		function dateTimeToLocalStr ( date ) {
			if (
				intlIsSupported &&
				Intl.DateTimeFormat.supportedLocalesOf( [ lang ] ).length &&
				date.toLocaleDateString &&
				date.toLocaleTimeString
			) {
				return date.toLocaleDateString( lang ) + ' ' + date.toLocaleTimeString( lang );
			} else {
				return dateToLocalStr( date ) + ' ' + timeToLocalStr( date );
			}
		}

		function dateToLocalStr ( date ) {
			if (
				intlIsSupported &&
				Intl.DateTimeFormat.supportedLocalesOf( [ lang ] ).length &&
				date.toLocaleDateString
			) {
				return date.toLocaleDateString( lang );
			} else {
				if ( navigator.language.toLowerCase() === 'en-us' ) {
					return ( date.getMonth() + 1 ) + '/' + date.getDate() + '/' + date.getFullYear();
				} else {
					return ( date.getDate() + '.' + date.getMonth() + 1 ) + '.' + date.getFullYear();
				}
			}
		}

		function timeToLocalStr ( date ) {
			if (
				intlIsSupported &&
				Intl.DateTimeFormat.supportedLocalesOf( [ lang ] ).length &&
				date.toLocaleTimeString
			) {
				return date.toLocaleTimeString( lang );
			} else {
				var hours = date.getHours();
				var minutes = date.getMinutes();

				if ( hours < 10 ) {	hours = '0' + hours; }
				if ( minutes < 10 ) { minutes = '0' + minutes; }

				if ( navigator.language.toLowerCase().indexOf( 'en' ) >= 0 ) {
					var amPm = 'AM';

					if ( hours > 12 ) {
						hours -= 12;
						amPm = 'PM';
					}

					return hours + ':' + minutes + ' ' + amPm;

				} else {
					return hours + ':' + minutes;
				}
			}
		}

		return {
			dateToStr: dateToStr,
			dateToLocalStr: dateToLocalStr,
			timeToLocalStr: timeToLocalStr,
			dateTimeToLocalStr: dateTimeToLocalStr,
			timestampToDate: timestampToDate
		};
	}
);