/* eslint-env node */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-eslint' );

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
			all: [
				'*.js',
				'src/**/*.js'
			]
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
	grunt.registerTask( 'test', [ 'eslint', 'git-build', 'build' ] );
	grunt.registerTask( 'default', 'test' );
};
