/*global define*/
define(
	function () {
		function toCamelCase ( str ) {
			// if array was passed
			if ( str && Array.isArray( str ) ) {
				str = str.join( ' ' );
			}

			var parts = str.split( /(-|\s|_)/gmi );
			var result = '';

			parts.forEach( function ( item, index ) {
				if ( ! item.match( /(-|\s|_)/gmi ) ) {
					if ( index > 0 && item.length > 1 ) {
						result += item.charAt( 0 ).toUpperCase() + item.slice( 1 );
					} else {
						result += item;
					}
				}
			} );

			return result;
		}

		function markdownToHtml ( str, options ) {
			return autop(
				markdownLinksToHtml( str, options.links ),
				options.autop
			);
		}

		function markdownLinksToHtml ( str, options ) {
			var attributes = [ ];
			var attributeStr = '';

			if ( options ) {
				if ( options.newTab ) {
					attributes.push( 'target="_blank"' );
				}

				if ( options.cssClasses ) {
					attributes.push( 'class="' + cssClasses + '"' );
				}
			}

			attributeStr = attributes.length ? ' ' + attributes.join( ' ' ) : '';
									
			var linkHTML = '<a href="$2"' + attributeStr + '>$1</a>';

			return str
				.replace( /\\n/gm, '\n')
				.replace( /\[(.*?)\]\((.+?)\)/g, linkHTML );
		}

		function autop ( str, options ) {
			var tag = ( options && options.tag ) ? options.tag : 'p';
			var lineBreakTag = ( options && options.linebreak ) ? '<' + options.linebreak + '>' : '<br />';
			var startTag = '<' + tag + '>';
			var endTag = '</' + tag + '>';

			if ( options && options.cssClasses && typeof options.cssClasses === 'string' ) {
				startTag = '<' + tag + ' class="' + options.cssClasses + '">';
			}

			return startTag + str
				.replace( /\n{2}/g, '&nbsp;' + endTag + startTag )
				.replace(/\n/g, '&nbsp;' + lineBreakTag ) +
			endTag;
		}

		// http://stackoverflow.com/a/1714899/229189
		function objToQueryStr ( obj, prefix ) {
			var str = [ ];
			
			for ( var p in obj ) {
				if ( obj.hasOwnProperty( p ) ) {
					var k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
					str.push( typeof v === 'object' ? objToQueryStr( v, k ) : encodeURIComponent( k ) + '=' + encodeURIComponent( v ) );
				}
			}
			
			return str.join( '&' );
		}

		return {
			toCamelCase: toCamelCase,
			autop: autop,
			markdownToHtml: markdownToHtml,
			markdownLinksToHtml: markdownLinksToHtml,
			objToQueryStr: objToQueryStr
		};
	}
)