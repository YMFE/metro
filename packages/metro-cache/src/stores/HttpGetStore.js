/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type {HttpOptions} from 'metro-cache';

const HttpStore = require('./HttpStore');
const {Logger} = require('metro-core');

class HttpGetStore<T> extends HttpStore<T> {
  _warned: boolean;

  constructor(options: HttpOptions) {
    super(options);

    this._warned = false;
  }

  async get(key: Buffer): Promise<?T> {
    try {
      return await super.get(key);
    } catch (err) {
      if (
        !(err instanceof HttpStore.HttpError) &&
        !(err instanceof HttpStore.NetworkError)
      ) {
        throw err;
      }

      this._warn(err);

      return null;
    }
  }

  set(): Promise<void> {
    return Promise.resolve(undefined);
  }

  _warn(err) {
    if (!this._warned) {
      process.emitWarning(
        [
          'Could not connect to the HTTP cache.',
          'Original error: ' + err.message,
        ].join(' '),
      );

      Logger.createEntry(`CACHE_ERROR: ${err.message} (${err.code})`);
      this._warned = true;
    }
  }
}

module.exports = HttpGetStore;
