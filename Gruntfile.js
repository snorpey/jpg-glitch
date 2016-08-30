// http://gruntjs.com/configuring-tasks
module.exports = function( grunt ) {
	var grunt_configuration = {
		pkg: grunt.file.readJSON( 'package.json' ),

		// concatenate all javascript files in scripts folder and compress them;
		// replace requirejs with the more lightweight almond js
		requirejs: {
			production: {
				options: {
					name: 'lib/almond',
					include: 'glitcher',
					baseUrl: 'scripts/',
					mainConfigFile: 'scripts/glitcher.js',
					out: 'production/glitcher.min.js',
					wrap: true
				}
			}
		},

		// minify css files in styles dir
		cssmin: {
			production: {
				files: {
					'production/glitcher.min.css': [ 'styles/glitcher.css' ]
				}
			}
		},

		// minify svg files
		svgmin: {
			production: {
				options: {
					plugins: [
						{ removeViewBox: false }
					]
				},
				files: [ {
					expand: true,
					cwd: './',
					src: 'images/icon/*.svg',
					dest: 'production/'
				}, {
					expand: true,
					cwd: './',
					src: 'images/logos/*.svg',
					dest: 'production/'
				} ]
			}
		},

		uglify: {
			options: {
				compress: {
					dead_code: true,
					properties: true,
					booleans: true,
					unused: true,
					hoist_funs: true,
					hoist_vars: true,
					if_return: true,
					join_vars: true
				},
				mangle: {
					sort: true,
					toplevel: true
				}
			},
			production: {
				files: [
					{ src: 'serviceworker.js', dest: 'production/serviceworker.min.js' },
					{ src: 'scripts/workers/glitchworker.js', dest: 'production/glitchworker.min.js' },
					{ src: [
						'scripts/lib/localforage.nopromises.js',
						'scripts/lib/md5.js',
						'scripts/workers/storageworker.js'
					], dest: 'production/storageworker.min.js' },
					{ src: [
						'scripts/lib/localforage.nopromises.js',
						'scripts/workers/settingsworker.js'
					], dest: 'production/settingsworker.min.js' }
				]
			}
		},

		// copy the index file
		copy: {
			productionTextBasedFiles: {
				options: { processContent: updateContent },
				files: [
					{ src: 'index.html', dest: 'production/index.html' },
					{ src: 'manifest.json', dest: 'production/manifest.json' },
					{ src: '.gitignore', dest: 'production/.gitignore' },
					{ src: 'LICENSE', dest: 'production/LICENSE' },
					{
						expand: true,
						cwd: './',
						src: [ 'lang/*.json' ],
						dest: 'production/'
					},
					
					// copying these files 'in place' to apply updateContent function 
					// that updates some of the paths in the minified files
					{ src: 'production/glitcher.min.js', dest: 'production/glitcher.min.js' },
					{ src: 'production/serviceworker.min.js', dest: 'production/serviceworker.min.js' },
					{ src: 'production/storageworker.min.js', dest: 'production/storageworker.min.js' },
					{ src: 'production/settingsworker.min.js', dest: 'production/settingsworker.min.js' },
					{ src: 'production/glitcher.min.css', dest: 'production/glitcher.min.css' }
				]
			},
			productionBinaryFiles: {
				files: [ {
					expand: true,
					cwd: './',
					src: [ 'images/*.jpg' ],
					dest: 'production/'
				}, {
					expand: true,
					cwd: './',
					src: [ 'images/logos/*.png' ],
					dest: 'production/'
				},
				{ src: 'favicon.ico', dest: 'production/favicon.ico' } ]
			}
		},

		// minify index file in production dir
		// including css and javascript
		htmlmin: {
			production: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					minifyCSS: true,
					minifyJS: {
						compress: {
							dead_code: true,
							properties: true,
							booleans: true,
							unused: true,
							hoist_funs: true,
							hoist_vars: true,
							if_return: true,
							join_vars: true
						},
						mangle: {
							sort: true,
							toplevel: true
						}
					},
					removeScriptTypeAttributes: true
				},
				files: [ {
					src: 'production/index.html', dest: 'production/index.html'
				} ]
			}
		},
	};

	// replace javscript and css paths when copying files
	function updateContent ( content, path ) {
		if ( path === 'index.html' ) {
			content = content
				.replace( 'styles/glitcher.css', 'glitcher.min.css' )
				.replace( 'scripts/lib/require.js', 'glitcher.min.js' )
				.replace( 'serviceworker.js', 'serviceworker.min.js' )
				.replace( "scriptEl.setAttribute( 'data-main', 'scripts/glitcher.js' );", '' );
		}

		if ( path === 'production/glitcher.min.js' ) {
			content = content
				.replace( 'scripts/workers/glitchworker.js', 'glitchworker.min.js' )
				.replace( 'scripts/workers/storageworker.js', 'storageworker.min.js' )
				.replace( 'scripts/workers/settingsworker.js', 'settingsworker.min.js' );
		}

		if ( path === 'production/serviceworker.min.js' ) {
			content = content
				.replace( /v\d+(.?\d*)+::/g, 'b' + Date.now() + '::' ) // 'v1.0.1::'' -> 'b{timestamp}'
				.replace( 'styles/glitcher.css', 'glitcher.min.css' )
				.replace( 'scripts/glitcher.js', 'glitcher.min.js' )
				.replace( 'scripts/workers/glitchworker.js', 'glitchworker.min.js' )
				.replace( 'scripts/workers/storageworker.js', 'storageworker.min.js' )
				.replace( 'scripts/workers/settingsworker.js', 'settingsworker.min.js' );
		}

		if ( path === 'production/storageworker.min.js' || 'production/settingsworker.min.js' ) {
			content = content.replace( /,importScripts\(.*\),/, ',' ); // replaces importScripts
		}

		if ( path === 'production/glitcher.min.css' ) {
			content = content.replace( /\.\.\/images\//gi, 'images/' ); // replaces importScripts
		}

		if ( path === 'manifest.json' ) {
			content = content.replace( 'serviceworker.js', 'serviceworker.min.js' );
		}

		return content;
	}

	grunt.initConfig( grunt_configuration );
	grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-htmlmin' );
	grunt.loadNpmTasks( 'grunt-svgmin' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );

	grunt.registerTask( 'default', [ 'requirejs', 'cssmin', 'svgmin', 'uglify', 'copy', 'htmlmin' ] );
	grunt.registerTask( 'production', [ 'requirejs', 'cssmin', 'copy' ] );
	grunt.registerTask( 'js', [ 'requirejs', 'uglify', 'copy' ] );
	grunt.registerTask( 'css', [ 'cssmin' ] );
	grunt.registerTask( 'cp', [ 'copy' ] );
	grunt.registerTask( 'html', [ 'copy', 'htmlmin' ] );
};