( function () {
	let router;

	const docTitle = 'Hello world';

	QUnit.module( 'Router', {
		beforeEach: function () {
			router = new OO.Router();
			this.sandbox = sinon.createSandbox();
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
			assert.true( true, 'run callback for route' );
		} );
		router.testHash = '#teststring';
		router.emit( 'hashchange' );
	} );

	QUnit.test( '#route, string with reg ex characters', function ( assert ) {
		router.testHash = '';
		router.route( '/$+foo/.*/(x-y)', function () {
			assert.true( true, 'run callback for route' );
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
		let count = 0;

		const spy = this.sandbox.spy(),
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
				assert.false( spy.called, 'don\'t run callback for prevented route' );
				done();
			}
		} );
		// emit a hashchange thrice to check if the hash has changed or not
		router.emit( 'hashchange.test' );
		router.emit( 'hashchange.test' );
		router.emit( 'hashchange.test' );
	} );

	QUnit.test( 'on back', function ( assert ) {
		const done1 = assert.async(),
			done2 = assert.async();
		this.sandbox.stub( window.history, 'back' );
		router.back().done( function () {
			assert.true( true, 'back 1 complete' );
			done1();
		} );
		router.back().done( function () {
			assert.true( true, 'back 2 complete' );
			done2();
		} );
		router.emit( 'popstate' );
	} );

	QUnit.test( 'on back without popstate', function ( assert ) {
		const historyStub = this.sandbox.stub( window.history, 'back' ),
			done = assert.async();
		router.on( 'popstate', function () {
			assert.true( false, 'this assertion is not supposed to get called' );
		} );

		router.back().done( function () {
			assert.true( historyStub.called, 'history back has been called' );
			assert.true( true, 'back without popstate complete' );
			done();
		} );
	} );

	QUnit.module( 'Router#navigate', {
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.sandbox.stub( document, 'title' ).value( docTitle );
			this.pushState = this.sandbox.stub( window.history, 'pushState' );
			this.replaceState = this.sandbox.stub( window.history, 'replaceState' );
			router = new OO.Router();
		},
		afterEach: function () {
			this.sandbox.verifyAndRestore();
		}
	} );

	QUnit.test( '#navigate("")', function ( assert ) {
		router.navigate( '' );
		assert.true( this.pushState.called, 'uses pushState to clear hash' );
	} );
	QUnit.test( '#navigate("foo")', function ( assert ) {
		router.navigate( 'foo' );
		assert.strictEqual( window.location.hash, '#foo',
			'Path is treated as the hash and pushState is called'
		);
	} );
	QUnit.test( '#navigateTo("/foo", { useReplaceState: true } )', function ( assert ) {
		router.navigateTo( 'Hello', { path: '/foo/bar#hash', useReplaceState: true } );
		assert.true(
			this.replaceState.calledWith( null, 'Hello', '/foo/bar#hash' ),
			'Path is treated as the hash and replaceState is called'
		);
	} );
	QUnit.test( '#navigateTo("#bar" )', function ( assert ) {
		router.navigateTo( 'Hello', { path: '#bar' } );
		assert.true(
			this.pushState.calledWith( null, 'Hello', '#bar' ),
			'Path is treated as the hash and pushState is called'
		);
	} );
}() );
