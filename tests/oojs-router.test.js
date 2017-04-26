/* eslint-env qunit */
/* global OO, sinon */
( function () {
	var router;

	QUnit.module( 'Router', {
		beforeEach: function () {
			router = new OO.Router();
			this.sandbox = sinon.sandbox.create();
			this.sandbox.stub( router, 'getPath' ).callsFake( function () {
				return router.testHash.slice( 1 );
			} );
			this.sandbox.stub( router, 'navigate' ).callsFake( function ( path ) {
				router.testHash = path;
			} );
		},
		afterEach: function () {
			this.sandbox.verifyAndRestore();
			router.testHash = '';
		}
	} );

	QUnit.test( '#route, string', function ( assert ) {
		router.testHash = '';
		router.route( 'teststring', function () {
			assert.ok( true, 'run callback for route' );
		} );
		router.testHash = '#teststring';
		router.emit( 'hashchange' );
	} );

	QUnit.test( '#route, string with reg ex characters', function ( assert ) {
		router.testHash = '';
		router.route( '/$+foo/.*/(x-y)', function () {
			assert.ok( true, 'run callback for route' );
		} );
		router.testHash = '#/$+foo/.*/(x-y)';
		router.emit( 'hashchange' );
	} );

	QUnit.test( '#route, RegExp', function ( assert ) {
		router.testHash = '';
		router.route( /^testre-(\d+)$/, function ( param ) {
			assert.strictEqual( param, '123', 'run callback for route with correct params' );
		} );
		router.testHash = '#testre-abc';
		router.emit( 'hashchange' );
		router.testHash = '#testre-123';
		router.emit( 'hashchange' );
	} );

	QUnit.test( 'on route', function ( assert ) {
		var count = 0,
			spy = this.sandbox.spy(),
			done = assert.async();

		router.testHash = '';
		router.route( 'testprevent', spy );

		// try preventing second route (#testprevent)
		router.once( 'route', function () {
			router.testHash = '#testprevent';
			router.once( 'route', function ( ev ) {
				ev.preventDefault();
			} );
		} );
		router.testHash = '#initial';

		router.on( 'hashchange.test', function () {
			++count;
			if ( count === 3 ) {
				assert.strictEqual( router.testHash, '#initial', 'reset hash' );
				assert.ok( !spy.called, 'don\'t run callback for prevented route' );
				done();
			}
		} );
		// emit a hashchange thrice to check if the hash has changed or not
		router.emit( 'hashchange.test' );
		router.emit( 'hashchange.test' );
		router.emit( 'hashchange.test' );
	} );

	QUnit.test( 'on back', function ( assert ) {
		var done1 = assert.async(),
			done2 = assert.async();
		this.sandbox.stub( window.history, 'back' );
		router.back().done( function () {
			assert.ok( true, 'back 1 complete' );
			done1();
		} );
		router.back().done( function () {
			assert.ok( true, 'back 2 complete' );
			done2();
		} );
		router.emit( 'popstate' );
	} );

	QUnit.test( 'on back without popstate', function ( assert ) {
		var historyStub = this.sandbox.stub( window.history, 'back' ),
			done = assert.async();
		router.on( 'popstate', function () {
			assert.ok( false, 'this assertion is not supposed to get called' );
		} );

		router.back().done( function () {
			assert.ok( historyStub.called, 'history back has been called' );
			assert.ok( true, 'back without popstate complete' );
			done();
		} );
	} );

}() );
