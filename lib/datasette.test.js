'use strict';

const assert = require('assertthat');
const cases = require('cases');

require('uglify-js');
require('roboter-cli');

const target = require('./datasette');

suite('datasette', () => {
  suite('create', () => {
    test('returns a new datasette instance.', done => {
      const cc = target.create();

      assert.that(cc.get).is.ofType('function');
      assert.that(cc.set).is.ofType('function');
      assert.that(cc.emit).is.ofType('function');
      assert.that(cc.on).is.ofType('function');
      assert.that(cc.once).is.ofType('function');
      assert.that(cc.off).is.ofType('function');
      done();
    });
  });

  suite('get', () => {
    test('returns undefined for a key that has not been set.', done => {
      const cc = target.create();

      assert.that(cc.get('foo')).is.undefined();
      done();
    });

    test('returns the value for a key that has been set.', cases([
      [ 'foo', 'bar' ],
      [ 'bar', 23 ],
      [ 'baz', true ]
    ], (key, value, done) => {
      const cc = target.create();

      cc.set(key, value);
      assert.that(cc.get(key)).is.equalTo(value);
      done();
    }));

    test('returns a new reference each time.', done => {
      const cc = target.create();

      cc.set('foo', { bar: 'baz' });
      assert.that(cc.get('foo')).is.not.sameAs(cc.get('foo'));
      done();
    });

    test('returns a deep-cloned object.', done => {
      const cc = target.create();
      const foo = [ 'bar' ];

      cc.set('foo', foo);
      foo.push('baz');

      assert.that(cc.get('foo')).is.equalTo([ 'bar' ]);
      done();
    });
  });

  suite('set', () => {
    test('stores the given key and value.', cases([
      [ 'foo', 'bar' ],
      [ 'bar', 23 ],
      [ 'baz', true ]
    ], (key, value, done) => {
      const cc = target.create();

      cc.set(key, value);
      assert.that(cc.get(key)).is.equalTo(value);
      done();
    }));

    test('emits a changed event.', done => {
      const cc = target.create();
      const input = { bar: 'baz' };

      cc.once('changed', (key, value) => {
        assert.that(key).is.equalTo('foo');
        assert.that(value).is.equalTo(input);
        done();
      });
      cc.set('foo', input);
    });

    test('emits a changed::* event.', cases([
      [ 'foo' ],
      [ 'bar' ],
      [ 'baz' ]
    ], (key, done) => {
      const cc = target.create();
      const value = { bar: 'baz' };

      cc.once(`changed::${key}`, actual => {
        assert.that(actual).is.equalTo(value);
        done();
      });
      cc.set(key, value);
    }));

    test('does not emit a changed event if the value has not been changed.', done => {
      const cc = target.create();
      let changedCounter = 0;

      cc.set('foo', { bar: 'baz' });
      cc.once('changed', () => {
        changedCounter += 1;
      });
      cc.set('foo', { bar: 'baz' });
      setTimeout(() => {
        assert.that(changedCounter).is.equalTo(0);
        done();
      }, 25);
    });

    test('does not emit a changed event if silent is set to true.', done => {
      const cc = target.create();
      let changedCounter = 0;

      cc.once('changed', () => {
        changedCounter += 1;
      });
      cc.set('foo', 'bar', { silent: true });
      setTimeout(() => {
        assert.that(changedCounter).is.equalTo(0);
        done();
      }, 25);
    });

    test('does not emit a changed::* event if the value has not been changed.', done => {
      const cc = target.create();
      let changedCounter = 0;

      cc.set('foo', { bar: 'baz' });
      cc.once('changed::foo', () => {
        changedCounter += 1;
      });
      cc.set('foo', { bar: 'baz' });
      setTimeout(() => {
        assert.that(changedCounter).is.equalTo(0);
        done();
      }, 25);
    });

    test('does not emit a changed::* event if silent is set to true.', done => {
      const cc = target.create();
      let changedCounter = 0;

      cc.set('foo', { bar: 'baz' });
      cc.once('changed::foo', () => {
        changedCounter += 1;
      });
      cc.set('foo', { bar: 'baz' }, { silent: true });
      setTimeout(() => {
        assert.that(changedCounter).is.equalTo(0);
        done();
      }, 25);
    });

    test('hands over a new reference on a changed event.', done => {
      const cc = target.create();
      const input = { bar: 'baz' };

      cc.once('changed', (key, value) => {
        assert.that(value).is.not.sameAs(input);
        done();
      });
      cc.set('foo', input);
    });

    test('hands over a new reference on a changed::* event.', done => {
      const cc = target.create();
      const input = { bar: 'baz' };

      cc.once('changed::foo', value => {
        assert.that(value).is.not.sameAs(input);
        done();
      });
      cc.set('foo', input);
    });

    test('updates a key that had been set before.', done => {
      const cc = target.create();

      cc.set('foo', 'bar');
      cc.set('foo', 'baz');
      assert.that(cc.get('foo')).is.equalTo('baz');
      done();
    });

    test('removes a key when value is missing.', done => {
      const cc = target.create();

      cc.set('foo', 'bar');
      cc.set('foo');
      assert.that(cc.get('foo')).is.undefined();
      done();
    });

    test('sets multiple key value pairs at once.', done => {
      const cc = target.create();

      cc.set({
        foo: 'bar',
        baz: 'bat'
      });
      assert.that(cc.get('foo')).is.equalTo('bar');
      assert.that(cc.get('baz')).is.equalTo('bat');
      done();
    });
  });
});
