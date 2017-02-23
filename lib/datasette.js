'use strict';

const cloneDeep = require('lodash/cloneDeep'),
      compare = require('comparejs'),
      defaults = require('lodash/defaults'),
      EventEmitter2 = require('eventemitter2').EventEmitter2;

const datasette = {
  create () {
    const data = {};

    const api = new EventEmitter2();

    api.get = function (key) {
      return cloneDeep(data[key]);
    };

    api.set = function (key, value, options) {
      if (typeof key === 'object') {
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

      options = defaults({}, options, {
        silent: false
      });

      if (compare.equal(data[key], value)) {
        return;
      }

      data[key] = cloneDeep(value);

      if (!options.silent) {
        this.emit('changed', key, cloneDeep(value));
        this.emit(`changed::${key}`, cloneDeep(value));
      }
    };

    return api;
  }
};

module.exports = datasette;
