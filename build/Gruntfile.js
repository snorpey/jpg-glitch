// http://gruntjs.com/configuring-tasks
module.exports = function( grunt )
{
	var grunt_configuration = {
		pkg: grunt.file.readJSON( 'package.json' ),
		requirejs: {
			index: {
				options: {
					name: 'lib/almond-0.2.6',
					include: 'main',
					baseUrl: '../scripts/',
					mainConfigFile: '../scripts/main.js',
					out: '../production/scripts/main.min.js',
					wrap: true
				}
			}
		},
		cssmin: {
			inline_import: {
				files: {
					'../production/styles/main.min.css': [ '../styles/main.css' ]
				}
			}
		},
		copy: {
			copy_html: {
				options: { processContent: updateHTML },
				files: [
					{ src: [ '../index.html' ], dest: '../production/index.html' }
				]
			}
		},
		imagemin: {
			jpg: {
				options: { progressive: true },
				files: [
					{
						expand: true,
						cwd: '../',
						src: [ '**/*.jpg', '!**/production/**', '!**/node_modules/**' ],
						dest: '../production/',
						ext: '.jpg'
					}
				]
			}
		}
	};

	function updateHTML( content, path )
	{
		if ( path === '../index.html' )
		{
			content = content
				.replace( 'href="styles/main.css"', 'href="styles/main.min.css"' )
				.replace( 'src="scripts/lib/require-2.1.4.js"', 'src="scripts/main.min.js"' )
				.replace( ' data-main="scripts/main"', '' );
		}

		return content;
	}

	grunt.initConfig( grunt_configuration );
	grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-imagemin' );

	grunt.registerTask( 'default', [ 'requirejs', 'cssmin', 'copy', 'imagemin' ] );
	grunt.registerTask( 'production', [ 'requirejs', 'cssmin', 'copy', 'imagemin' ] );
	grunt.registerTask( 'js', [ 'requirejs' ] );
	grunt.registerTask( 'css', [ 'cssmin' ] );
	grunt.registerTask( 'cp', [ 'copy' ] );
	grunt.registerTask( 'img', [ 'imagemin' ] );
};