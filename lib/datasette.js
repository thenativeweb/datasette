'use strict';

var _ = require('underscore'),
    EventEmitter2 = require('eventemitter2').EventEmitter2;

var datasette = {
  create: function (callback) {
    var data = {};

    var api = new EventEmitter2();

    api.get = function (key) {
      return _.clone(data[key]);
    };

    api.set = function (key, value, options) {
      if ((typeof key) === 'object') {
        if (value) {
          options = value;
          value = undefined;
        }

        for (var i in key) {
          if (key.hasOwnProperty(i)) {
            this.set(i, key[i], options);
          }
        }
        return;
      }

      options = _.defaults({}, options, {
        silent: false
      });

      if (data[key] === value) {
        return;
      }

      data[key] = value;

      if (!options.silent) {
        this.emit('changed', key, _.clone(value));
        this.emit('changed::' + key, _.clone(value));
      }
    };

    callback(null, api);
  }
};

module.exports = datasette;