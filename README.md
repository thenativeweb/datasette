# datasette

datasette is a key-value container for arbitrary data.

## Installation

At the moment, installation of this module must be made manually.

## Quick start

The first thing you need to do is to integrate datasette into your application. For that add a reference to the `datasette` module.

```javascript
var datasette = require('datasette');
```

Next, you can create a new data container. For that you need to call the `create` function.

```javascript
datasette.create(function (err, cc) {
  // ...
});
```

### Setting data

To set data, call the data container's `set` function and specify the `key` and the `value` you want to store.

```javascript
cc.set('foo', { bar: 'baz' });
```

To set multiple keys and values at once, you can also hand over an object that contains the data.

```javascript
cc.set({
  foo: 23,
  bar: 42
});
```

This is equivalent to calling `set` two times with separate key value pairs.

### Getting data

To get data, call the data container's `get` function and specify the `key` you would like to retrieve.

```javascript
var value = cc.get('foo');
```

*Note: Each time you call `get`, you will get a cloned result to avoid conflicting state changes on a shared reference.*

### Dealing with events

Every time a value is created, changed or deleted, the data container will emit a `changed` event. Use the `on` or `once` functions to subscribe to this event.

cc.on('changed', function (key, value) {
  // ...
});

If you are only interested in `changed` events for a specific `key`, subscribe to the `changed::*` event instead.

cc.on('changed::foo', function (value) {
  // ...
});

*Note: If you set the same key value pair two times, the data container will not emit an event on the second `set` call.*

To unsubscribe from event notifications, use the `off` function.

### Suppressing events

If you don't want a `set` call to result in an emitted event, you can specify an `options` object and set its `silent` property to `true`.

cc.set('foo', 'bar', { silent: true });

## Running the tests

datasette has been developed using TDD. To run the tests, go to the folder where you have installed datasette to and run `npm test`. You need to have [mocha](https://github.com/visionmedia/mocha) installed.

    $ npm test

Additionally, this module can be built using [Grunt](http://gruntjs.com/). Besides running the tests, Grunt also analyses the code using [JSHint](http://www.jshint.com/). To run Grunt, go to the folder where you have installed datasette and run `grunt`. You need to have [grunt-cli](https://github.com/gruntjs/grunt-cli) installed.

    $ grunt