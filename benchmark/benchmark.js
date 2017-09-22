/**
 * Equihash for Node.js.
 * benchmark.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc.
 *
 * MIT License
 * <https://github.com/digitalbazaar/equihash/blob/master/LICENSE>
 */
const Benchmark = require('benchmark');
const assert = require('assert');
const equihash = require('..');
const crypto = require('crypto');
// tests and helpers
const vectors = require('../test/test-vectors');

const suite = new Benchmark.Suite;

function _seed(s='') {
  return crypto.createHash('sha256').update('hello world' + s, 'utf8').digest();
}

let seed;
let i;

// test deferred test overhead
/*
suite
  .add({
    name: 'noop not deferred',
    defer: false,
    fn: () => {}
  })
  .add({
    name: 'noop deferred',
    defer: true,
    fn: deferred => {
      deferred.resolve();
    }
  });
*/

// test verify
vectors.benchmarks.forEach(test => {
  test.inputs.forEach(inputs => {
    suite.add({
      name: 'verify ' + test.label + ' (async)',
      defer: true,
      fn: deferred => {
        const proof = {
          n: test.n,
          k: test.k,
          nonce: test.nonce,
          solution: inputs
        };
        equihash.verify(new Uint8Array(test.seed), proof, (err, verified) => {
          assert.ifError(err);
          assert(verified);
          deferred.resolve();
        });
      }
    });
    suite.add({
      name: 'verify ' + test.label + ' (sync)',
      defer: true,
      fn: deferred => {
        const proof = {
          n: test.n,
          k: test.k,
          nonce: test.nonce,
          solution: inputs
        };
        const verified = equihash.verifySync(new Uint8Array(test.seed), proof);
        assert(verified);
        deferred.resolve();
      }
    });
  });
});

// test solve
suite
  .add({
    name: 'solve n=90,k=5,seeds=1',
    defer: true,
    setup: () => {
      seed = _seed();
    },
    fn: deferred => {
      const options = {
        n: 90,
        k: 5
      };
      equihash.solve(seed, options, (err, proof) => {
        assert.ifError(err);
        deferred.resolve();
      });
    }
  })
  .add({
    name: 'solve n=90,k=5,seeds=100',
    defer: true,
    setup: () => {
      seeds = [];
      for(i = 0; i < 100; ++i) {
        seeds.push(_seed(i.toString()));
      }
      i = 0;
    },
    fn: deferred => {
      const options = {
        n: 90,
        k: 5
      };
      equihash.solve(seeds[i], options, (err, proof) => {
        i = (i + 1) % 100;
        assert.ifError(err);
        deferred.resolve();
      });
    }
  })
  .add({
    name: 'solve n=96,k=5',
    defer: true,
    setup: () => {
      seed = _seed();
    },
    fn: deferred => {
      const options = {
        n: 96,
        k: 5
      };
      equihash.solve(seed, options, (err, proof) => {
        assert.ifError(err);
        deferred.resolve();
      });
    }
  })
  .add({
    name: 'solve n=64,k=3',
    defer: true,
    setup: () => {
      seed = _seed();
    },
    fn: deferred => {
      const options = {
        n: 64,
        k: 3
      };
      equihash.solve(seed, options, (err, proof) => {
        assert.ifError(err);
        deferred.resolve();
      });
    }
  })
  /*
  .add({
    name: 'solve n=128,k=7',
    defer: true,
    setup: () => {
      seed = _seed();
    },
    fn: deferred => {
      const options = {
        n: 128,
        k: 7
      };
      equihash.solve(seed, options, (err, proof) => {
        assert.ifError(err);
        deferred.resolve();
      });
    }
  })
  */
  ;

suite
  .on('start', () => {
    console.log('Benchmarking...');
  })
  .on('cycle', event => console.log(String(event.target)))
  .on('complete', () => {
    console.log('Done.');
  })
  .run({async: true});
