'use strict';

var assert = require('node-assertthat'),
    cases = require('cases');

var datasette = require('../lib/datasette');

suite('datasette', function () {
  suite('create', function () {
    test('returns a new datasette instance.', function () {
      var cc = datasette.create();
      assert.that(cc.get, is.ofType('function'));
      assert.that(cc.set, is.ofType('function'));
      assert.that(cc.emit, is.ofType('function'));
      assert.that(cc.on, is.ofType('function'));
      assert.that(cc.once, is.ofType('function'));
      assert.that(cc.off, is.ofType('function'));
    });
  });

  suite('get', function () {
    test('returns undefined for a key that has not been set.', function () {
      var cc = datasette.create();
      assert.that(cc.get('foo'), is.undefined());
    });

    test('returns the value for a key that has been set.', cases([
      [ 'foo', 'bar' ],
      [ 'bar', 23 ],
      [ 'baz', true ]
    ], function (key, value) {
      var cc = datasette.create();
      cc.set(key, value);
      assert.that(cc.get(key), is.equalTo(value));
    }));

    test('returns a new reference each time.', function () {
      var cc = datasette.create();
      cc.set('foo', { bar: 'baz' });
      assert.that(cc.get('foo'), is.not.sameAs(cc.get('foo')));
    });
  });

  suite('set', function () {
    test('stores the given key and value.', cases([
      [ 'foo', 'bar' ],
      [ 'bar', 23 ],
      [ 'baz', true ]
    ], function (key, value) {
      var cc = datasette.create();
      cc.set(key, value);
      assert.that(cc.get(key), is.equalTo(value));
    }));

    test('emits a changed event.', function (done) {
      var cc = datasette.create();
      var input = { bar: 'baz' };
      cc.once('changed', function (key, value) {
        assert.that(key, is.equalTo('foo'));
        assert.that(value, is.equalTo(input));
        done();
      });
      cc.set('foo', input);
    });

    test('emits a changed::* event.', cases([
      [ 'foo' ],
      [ 'bar' ],
      [ 'baz' ]
    ], function (key, done) {
      var cc = datasette.create();
      var value = { bar: 'baz' };
      cc.once('changed::' + key, function (actual) {
        assert.that(actual, is.equalTo(value));
        done();
      });
      cc.set(key, value);
    }));

    test('does not emit a changed event if the value has not been changed.', function (done) {
      var cc = datasette.create();
      var changedCounter = 0;
      cc.set('foo', { bar: 'baz' });
      cc.once('changed', function () {
        changedCounter++;
      });
      cc.set('foo', { bar: 'baz' });
      setTimeout(function () {
        assert.that(changedCounter, is.equalTo(0));
        done();
      }, 25);
    });

    test('does not emit a changed event if silent is set to true.', function (done) {
      var cc = datasette.create();
      var changedCounter = 0;
      cc.once('changed', function () {
        changedCounter++;
      });
      cc.set('foo', 'bar', { silent: true });
      setTimeout(function () {
        assert.that(changedCounter, is.equalTo(0));
        done();
      }, 25);
    });

    test('does not emit a changed::* event if the value has not been changed.', function (done) {
      var cc = datasette.create();
      var changedCounter = 0;
      cc.set('foo', { bar: 'baz' });
      cc.once('changed::foo', function () {
        changedCounter++;
      });
      cc.set('foo', { bar: 'baz' });
      setTimeout(function () {
        assert.that(changedCounter, is.equalTo(0));
        done();
      }, 25);
    });

    test('does not emit a changed::* event if silent is set to true.', function (done) {
      var cc = datasette.create();
      var changedCounter = 0;
      cc.set('foo', { bar: 'baz' });
      cc.once('changed::foo', function () {
        changedCounter++;
      });
      cc.set('foo', { bar: 'baz' }, { silent: true });
      setTimeout(function () {
        assert.that(changedCounter, is.equalTo(0));
        done();
      }, 25);
    });

    test('hands over a new reference on a changed event.', function (done) {
      var cc = datasette.create();
      var input = { bar: 'baz' };
      cc.once('changed', function (key, value) {
        assert.that(value, is.not.sameAs(input));
        done();
      });
      cc.set('foo', input);
    });

    test('hands over a new reference on a changed::* event.', function (done) {
      var cc = datasette.create();
      var input = { bar: 'baz' };
      cc.once('changed::foo', function (value) {
        assert.that(value, is.not.sameAs(input));
        done();
      });
      cc.set('foo', input);
    });

    test('updates a key that had been set before.', function () {
      var cc = datasette.create();
      cc.set('foo', 'bar');
      cc.set('foo', 'baz');
      assert.that(cc.get('foo'), is.equalTo('baz'));
    });

    test('removes a key when value is missing.', function () {
      var cc = datasette.create();
      cc.set('foo', 'bar');
      cc.set('foo');
      assert.that(cc.get('foo'), is.undefined());
    });

    test('sets multiple key value pairs at once.', function () {
      var cc = datasette.create();
      cc.set({
        foo: 'bar',
        baz: 'bat'
      });
      assert.that(cc.get('foo'), is.equalTo('bar'));
      assert.that(cc.get('baz'), is.equalTo('bat'));
    });
  });
});
