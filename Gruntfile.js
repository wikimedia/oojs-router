/*!
 * Grunt file
 */

/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-jscs' );

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
		jshint: {
			options: {
				jshintrc: true
			},
			dev: [
				'*.js',
				'src/**/*.js'
			]
		},
		jscs: {
			dev: '<%= jshint.dev %>'
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
		watch: {
			files: [
				'.{jscsrc,jshintrc}',
				'<%= jshint.dev %>'
			],
			tasks: 'test'
		}
	} );

	grunt.registerTask( 'git-build', function () {
		var done = this.async();
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
	grunt.registerTask( 'test', [ 'git-build', 'build', 'jshint', 'jscs' ] );
	grunt.registerTask( 'default', 'test' );
};
