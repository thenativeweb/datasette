'use strict';

const _ = require('lodash'),
    compare = require('comparejs'),
    EventEmitter2 = require('eventemitter2').EventEmitter2;

const datasette = {
  create () {
    const data = {};

    const api = new EventEmitter2();

    api.get = function (key) {
      return _.cloneDeep(data[key]);
    };

    api.set = function (key, value, options) {
      if ((typeof key) === 'object') {
        if (value) {
          options = value;
          value = undefined;
        }

        for (const i in key) {
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
