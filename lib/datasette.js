'use strict';

var EventEmitter2 = require('eventemitter2').EventEmitter2,
    _ = require('lodash'),
    compare = require('comparejs');

var datasette = {
  create: function () {
    var data = {};

    var api = new EventEmitter2();

    api.get = function (key) {
      return _.cloneDeep(data[key]);
    };

    api.set = function (key, value, options) {
      var i;

      if ((typeof key) === 'object') {
        if (value) {
          options = value;
          value = undefined;
        }

        for (i in key) {
          if (key.hasOwnProperty(i)) {
            this.set(i, key[i], options);
          }
        }
        return;
      }

      options = _.defaults({}, options, {
        silent: false
      });


      if (compare.equal(data[key], value)) {
        return;
      }

      data[key] = _.cloneDeep(value);

      if (!options.silent) {
        this.emit('changed', key, _.cloneDeep(value));
        this.emit('changed::' + key, _.cloneDeep(value));
      }
    };

    return api;
  }
};

module.exports = datasette;
