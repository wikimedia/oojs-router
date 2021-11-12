'use strict';

module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-karma' );

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		clean: {
			dist: 'dist/*'
		},
		concat: {
			router: {
				options: {
					banner: grunt.file.read( 'src/banner.txt' )
				},
				dest: 'dist/oojs-router.js',
				src: [
					'src/intro.js.txt',
					'src/index.js',
					'src/outro.js.txt'
				]
			}
		},
		eslint: {
			options: {
				cache: true
			},
			all: '.'
		},
		uglify: {
			options: {
				banner: '/*! OOjs Router v<%= pkg.version %> | http://oojs.mit-license.org */',
				sourceMap: true,
				sourceMapIncludeSources: true,
				report: 'gzip'
			},
			js: {
				expand: true,
				src: 'dist/*.js',
				ext: '.min.js',
				extDot: 'last'
			}
		},
		karma: {
			options: {
				frameworks: [ 'qunit' ],
				files: [
					'node_modules/jquery/dist/jquery.js',
					'node_modules/oojs/dist/oojs.js',
					'node_modules/sinon/pkg/sinon.js',
					'dist/oojs-router.js',
					'tests/**/*.test.js'
				],
				reporters: [ 'dots' ],
				singleRun: true,
				autoWatch: false,
				browserDisconnectTimeout: 5000,
				browserDisconnectTolerance: 2,
				browserNoActivityTimeout: 9000,
				customLaunchers: {
					ChromeCustom: {
						base: 'ChromeHeadless',
						// Chrome requires --no-sandbox in Docker/CI.
						flags: ( process.env.CHROMIUM_FLAGS || '' ).split( ' ' )
					}
				}
			},
			main: {
				browsers: [ 'ChromeCustom' ],
				preprocessors: {
					'dist/*.js': [ 'coverage' ]
				},
				reporters: [ 'dots', 'coverage' ],
				coverageReporter: {
					dir: 'coverage/',
					subdir: '.',
					reporters: [
						{ type: 'clover' },
						{ type: 'text-summary' },
						{ type: 'html' }
					]
				}
			},
			other: {
				browsers: [ 'FirefoxHeadless' ]
			}
		}
	} );

	grunt.registerTask( 'git-build', function () {
		const done = this.async();
		require( 'child_process' ).exec( 'git rev-parse HEAD', function ( err, stout, stderr ) {
			if ( !stout || err || stderr ) {
				grunt.log.err( err || stderr );
				done( false );
				return;
			}
			grunt.config.set( 'pkg.version', grunt.config( 'pkg.version' ) + '-pre (' + stout.slice( 0, 10 ) + ')' );
			grunt.verbose.writeln( 'Added git HEAD to pgk.version' );
			done();
		} );
	} );

	grunt.registerTask( 'build', [ 'clean', 'concat', 'uglify' ] );
	grunt.registerTask( 'test', [ 'eslint', 'git-build', 'build', 'karma' ] );
};
