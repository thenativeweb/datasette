'use strict';

const cloneDeep = require('lodash/cloneDeep'),
      compare = require('comparejs'),
      defaults = require('lodash/defaults'),
      EventEmitter2 = require('eventemitter2').EventEmitter2;

const frz = Object.freeze || cloneDeep;

const datasette = {
  create () {
    const data = {};

    const api = new EventEmitter2();

    api.get = key => frz(data[key]);

    api.set = function set (key, value, options) {
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

      if (compare.equal(data[key], value)) {
        return;
      }

      data[key] = frz(value);

      options = defaults({}, options, {
        silent: false
      });

      if (!options.silent) {
        this.emit('changed', key, frz(value));
        this.emit(`changed::${key}`, frz(value));
      }
    };

    return api;
  }
};

module.exports = datasette;
