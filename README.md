# noble-hashes-grs ![Node CI](https://github.com/Groestlcoin/noble-hashes-grs/workflows/Node%20CI/badge.svg) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

This is a fork of `noble-hashes` at https://github.com/paulmillr/noble-hashes, but with the addition of groestl.

Audited & minimal JS implementation of SHA2, SHA3, RIPEMD, BLAKE2/3, HMAC, HKDF, PBKDF2 & Scrypt.

- **noble** family, zero dependencies
- 🔒 [**Audited**](#security) by an independent security firm: no vulnerabilities have been found
- 🔻 Tree-shaking-friendly: there is no entry point, which ensures small size of your app
- 🔁 No unrolled loops: makes it easier to verify and reduces source code size up to 5x
- 🏎 Ultra-fast, hand-optimized for caveats of JS engines
- 🔍 Unique tests ensure correctness: chained tests, sliding window tests, DoS tests
- 🧪 Differential fuzzing ensures even more correctness with [cryptofuzz](https://github.com/guidovranken/cryptofuzz)
- 🐢 Scrypt supports `N: 2**22`, while other implementations are limited to `2**20`
- 🦘 SHA3 supports Keccak, TupleHash, KangarooTwelve and MarsupilamiFourteen
- 🪶 Just 3.4k lines / 17KB gzipped. SHA256-only is 240 lines / 3KB gzipped

The library's initial development was funded by [Ethereum Foundation](https://ethereum.org/).

### This library belongs to _noble_ crypto

> **noble-crypto** — high-security, easily auditable set of contained cryptographic libraries and tools.

- No dependencies, small files
- Easily auditable TypeScript/JS code
- Supported in all major browsers and stable node.js versions
- All releases are signed with PGP keys
- Check out [homepage](https://paulmillr.com/noble/) & all libraries:
  [curves](https://github.com/paulmillr/noble-curves) ([secp256k1](https://github.com/paulmillr/noble-secp256k1),
  [ed25519](https://github.com/paulmillr/noble-ed25519),
  [bls12-381](https://github.com/paulmillr/noble-bls12-381)),
  [hashes](https://github.com/paulmillr/noble-hashes)

## Usage

Use NPM in node.js / browser, or include single file from
[GitHub's releases page](https://github.com/Groestlcoin/noble-hashes-grs/releases):

> npm install hashes-grs

The library does not have an entry point. It allows you to select specific primitives and drop everything else. If you only want to use sha256, just use the library with rollup or other bundlers. This is done to make your bundles tiny.

```js
// Common.js and ECMAScript Modules (ESM)
import { sha256 } from 'hashes-grs/sha256';
console.log(sha256(new Uint8Array([1, 2, 3]))); // Uint8Array(32) [3, 144, 88, 198, 242...]
// you could also pass strings that will be UTF8-encoded to Uint8Array
console.log(sha256('abc')); // == sha256(new TextEncoder().encode('abc'))

// sha384 is here, because it uses same internals as sha512
import { sha512, sha512_256, sha384 } from 'hashes-grs/sha512';
// prettier-ignore
import {
  sha3_224, sha3_256, sha3_384, sha3_512,
  keccak_224, keccak_256, keccak_384, keccak_512,
  shake128, shake256
} from 'hashes-grs/sha3';
// prettier-ignore
import {
  cshake128, cshake256, kmac128, kmac256,
  k12, m14,
  tuplehash256, parallelhash256, keccakprg
} from 'hashes-grs/sha3-addons';
import { ripemd160 } from 'hashes-grs/ripemd160';
import { blake3 } from 'hashes-grs/blake3';
import { blake2b } from 'hashes-grs/blake2b';
import { blake2s } from 'hashes-grs/blake2s';
import { hmac } from 'hashes-grs/hmac';
import { hkdf } from 'hashes-grs/hkdf';
import { pbkdf2, pbkdf2Async } from 'hashes-grs/pbkdf2';
import { scrypt, scryptAsync } from 'hashes-grs/scrypt';

import { sha1 } from 'hashes-grs/sha1'; // legacy

// small utility method that converts bytes to hex
import { bytesToHex as toHex } from 'hashes-grs/utils';
console.log(toHex(sha256('abc'))); // ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
```

## API

All hash functions:

- can be called directly, with `Uint8Array`.
- return `Uint8Array`
- can receive `string`, which is automatically converted to `Uint8Array`
  via utf8 encoding **(not hex)**
- support hashing 4GB of data per update on 64-bit systems (unlimited with streaming)

```ts
function hash(message: Uint8Array | string): Uint8Array;
hash(new Uint8Array([1, 3]));
hash('string') == hash(new TextEncoder().encode('string'));
```

All hash functions can be constructed via `hash.create()` method:

- the result is `Hash` subclass instance, which has `update()` and `digest()` methods
- `digest()` finalizes the hash and makes it no longer usable

```ts
hash
  .create()
  .update(new Uint8Array([1, 3]))
  .digest();
```

_Some_ hash functions can also receive `options` object, which can be either passed as a:

- second argument to hash function: `blake3('abc', { key: 'd', dkLen: 32 })`
- first argument to class initializer: `blake3.create({ context: 'e', dkLen: 32 })`

## Modules

- [SHA2 (sha256, sha384, sha512, sha512_256)](#sha2-sha256-sha384-sha512-sha512_256)
- [SHA3 (FIPS, SHAKE, Keccak)](#sha3-fips-shake-keccak)
- [SHA3 Addons (cSHAKE, KMAC, KangarooTwelve, MarsupilamiFourteen)](#sha3-addons-cshake-kmac-tuplehash-parallelhash-kangarootwelve-marsupilamifourteen)
- [RIPEMD-160](#ripemd-160)
- [BLAKE2b, BLAKE2s](#blake2b-blake2s)
- [BLAKE3](#blake3)
- [SHA1 (legacy)](#sha1-legacy)
- [HMAC](#hmac)
- [HKDF](#hkdf)
- [PBKDF2](#pbkdf2)
- [Scrypt](#scrypt)
- [ESKDF](#eskdf)
- [utils](#utils)

##### SHA2 (sha256, sha384, sha512, sha512_256)

```typescript
import { sha256 } from 'hashes-grs/sha256';
const h1a = sha256('abc');
const h1b = sha256
  .create()
  .update(Uint8Array.from([1, 2, 3]))
  .digest();
```

```typescript
import { sha512 } from 'hashes-grs/sha512';
const h2a = sha512('abc');
const h2b = sha512
  .create()
  .update(Uint8Array.from([1, 2, 3]))
  .digest();

// SHA512/256 variant
import { sha512_256 } from 'hashes-grs/sha512';
const h3a = sha512_256('abc');
const h3b = sha512_256
  .create()
  .update(Uint8Array.from([1, 2, 3]))
  .digest();

// SHA384
import { sha384 } from 'hashes-grs/sha512';
const h4a = sha384('abc');
const h4b = sha384
  .create()
  .update(Uint8Array.from([1, 2, 3]))
  .digest();
```

See [RFC 4634](https://datatracker.ietf.org/doc/html/rfc4634) and [the paper on SHA512/256](https://eprint.iacr.org/2010/548.pdf).

##### SHA3 (FIPS, SHAKE, Keccak)

```typescript
import {
  sha3_224,
  sha3_256,
  sha3_384,
  sha3_512,
  keccak_224,
  keccak_256,
  keccak_384,
  keccak_512,
  shake128,
  shake256,
} from 'hashes-grs/sha3';
const h5a = sha3_256('abc');
const h5b = sha3_256
  .create()
  .update(Uint8Array.from([1, 2, 3]))
  .digest();
const h6a = keccak_256('abc');
const h7a = shake128('abc', { dkLen: 512 });
const h7b = shake256('abc', { dkLen: 512 });
```

See ([FIPS PUB 202](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf), [Website](https://keccak.team/keccak.html)).

Check out [the differences between SHA-3 and Keccak](https://crypto.stackexchange.com/questions/15727/what-are-the-key-differences-between-the-draft-sha-3-standard-and-the-keccak-sub)

##### SHA3 Addons (cSHAKE, KMAC, TupleHash, ParallelHash, KangarooTwelve, MarsupilamiFourteen)

```typescript
import {
  cshake128,
  cshake256,
  kmac128,
  kmac256,
  k12,
  m14,
  tuplehash128,
  tuplehash256,
  parallelhash128,
  parallelhash256,
  keccakprg,
} from 'hashes-grs/sha3-addons';
const h7c = cshake128('abc', { personalization: 'def' });
const h7d = cshake256('abc', { personalization: 'def' });
const h7e = kmac128('key', 'message');
const h7f = kmac256('key', 'message');
const h7h = k12('abc');
const h7g = m14('abc');
const h7i = tuplehash128(['ab', 'c']); // tuplehash(['ab', 'c']) !== tuplehash(['a', 'bc']) !== tuplehash(['abc'])
// Same as k12/blake3, but without reduced number of rounds. Doesn't speedup anything due lack of SIMD and threading,
// added for compatibility.
const h7j = parallelhash128('abc', { blockLen: 8 });
// pseudo-random generator, first argument is capacity. XKCP recommends 254 bits capacity for 128-bit security strength.
// * with a capacity of 254 bits.
const p = keccakprg(254);
p.feed('test');
const rand1b = p.fetch(1);
```

- Full [NIST SP 800-185](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-185.pdf): cSHAKE, KMAC, TupleHash, ParallelHash + XOF variants
- 🦘 K12 ([KangarooTwelve Paper](https://keccak.team/files/KangarooTwelve.pdf), [RFC Draft](https://www.ietf.org/archive/id/draft-irtf-cfrg-kangarootwelve-06.txt)) and M14 aka MarsupilamiFourteen are basically parallel versions of Keccak with reduced number of rounds (same as Blake3 and ParallelHash).
- [KeccakPRG](https://keccak.team/files/CSF-0.1.pdf): Pseudo-random generator based on Keccak

##### RIPEMD-160

```typescript
import { ripemd160 } from 'hashes-grs/ripemd160';
// function ripemd160(data: Uint8Array): Uint8Array;
const hash8 = ripemd160('abc');
const hash9 = ripemd160()
  .create()
  .update(Uint8Array.from([1, 2, 3]))
  .digest();
```

See [RFC 2286](https://datatracker.ietf.org/doc/html/rfc2286), [Website](https://homes.esat.kuleuven.be/~bosselae/ripemd160.html)

##### BLAKE2b, BLAKE2s

```typescript
import { blake2b } from 'hashes-grs/blake2b';
import { blake2s } from 'hashes-grs/blake2s';
const h10a = blake2s('abc');
const b2params = { key: new Uint8Array([1]), personalization: t, salt: t, dkLen: 32 };
const h10b = blake2s('abc', b2params);
const h10c = blake2s
  .create(b2params)
  .update(Uint8Array.from([1, 2, 3]))
  .digest();
```

See [RFC 7693](https://datatracker.ietf.org/doc/html/rfc7693), [Website](https://www.blake2.net).

##### BLAKE3

```typescript
import { blake3 } from 'hashes-grs/blake3';
// All params are optional
const h11 = blake3('abc', { dkLen: 256, key: 'def', context: 'fji' });
```

##### SHA1 (legacy)

SHA1 was cryptographically broken, however, it was not broken for cases like HMAC.

See [RFC4226 B.2](https://datatracker.ietf.org/doc/html/rfc4226#appendix-B.2).

Don't use it for a new protocol.

```typescript
import { sha1 } from 'hashes-grs/sha1';
const h12 = sha1('def');
```

##### HMAC

```typescript
import { hmac } from 'hashes-grs/hmac';
import { sha256 } from 'hashes-grs/sha256';
const mac1 = hmac(sha256, 'key', 'message');
const mac2 = hmac.create(sha256, Uint8Array.from([1, 2, 3])).update(Uint8Array.from([4, 5, 6])).digest();
```

Matches [RFC 2104](https://datatracker.ietf.org/doc/html/rfc2104).

##### HKDF

```typescript
import { hkdf } from 'hashes-grs/hkdf';
import { sha256 } from 'hashes-grs/sha256';
import { randomBytes } from 'hashes-grs/utils';
const inputKey = randomBytes(32);
const salt = randomBytes(32);
const info = 'abc';
const dkLen = 32;
const hk1 = hkdf(sha256, inputKey, salt, info, dkLen);

// == same as
import * as hkdf from 'hashes-grs/hkdf';
import { sha256 } from 'hashes-grs/sha256';
const prk = hkdf.extract(sha256, inputKey, salt);
const hk2 = hkdf.expand(sha256, prk, info, dkLen);
```

Matches [RFC 5869](https://datatracker.ietf.org/doc/html/rfc5869).

##### PBKDF2

```typescript
import { pbkdf2, pbkdf2Async } from 'hashes-grs/pbkdf2';
import { sha256 } from 'hashes-grs/sha256';
const pbkey1 = pbkdf2(sha256, 'password', 'salt', { c: 32, dkLen: 32 });
const pbkey2 = await pbkdf2Async(sha256, 'password', 'salt', { c: 32, dkLen: 32 });
const pbkey3 = await pbkdf2Async(sha256, Uint8Array.from([1, 2, 3]), Uint8Array.from([4, 5, 6]), {
  c: 32,
  dkLen: 32,
});
```

Matches [RFC 2898](https://datatracker.ietf.org/doc/html/rfc2898).

##### Scrypt

```typescript
import { scrypt, scryptAsync } from 'hashes-grs/scrypt';
const scr1 = scrypt('password', 'salt', { N: 2 ** 16, r: 8, p: 1, dkLen: 32 });
const scr2 = await scryptAsync('password', 'salt', { N: 2 ** 16, r: 8, p: 1, dkLen: 32 });
const scr3 = await scryptAsync(Uint8Array.from([1, 2, 3]), Uint8Array.from([4, 5, 6]), {
  N: 2 ** 22,
  r: 8,
  p: 1,
  dkLen: 32,
  onProgress(percentage) {
    console.log('progress', percentage);
  },
  maxmem: 2 ** 32 + 128 * 8 * 1, // N * r * p * 128 + (128*r*p)
});
```

Matches [RFC 7914](https://datatracker.ietf.org/doc/html/rfc7914), [Website](https://www.tarsnap.com/scrypt.html)

- `N, r, p` are work factors. To understand them, see [the blog post](https://blog.filippo.io/the-scrypt-parameters/).
- `dkLen` is the length of output bytes
- It is common to use N from `2**10` to `2**22` and `{r: 8, p: 1, dkLen: 32}`
- `onProgress` can be used with async version of the function to report progress to a user.

Memory usage of scrypt is calculated with the formula `N * r * p * 128 + (128 * r * p)`, which means
`{N: 2 ** 22, r: 8, p: 1}` will use 4GB + 1KB of memory. To prevent DoS, we limit scrypt to `1GB + 1KB` of RAM used,
which corresponds to `{N: 2 ** 20, r: 8, p: 1}`. If you want to use higher values, increase `maxmem` using the formula above.

_Note:_ noble supports `2**22` (4GB RAM) which is the highest amount amongst JS libs. Many other implementations don't support it.
We cannot support `2**23`, because there is a limitation in JS engines that makes allocating
arrays bigger than 4GB impossible, but we're looking into other possible solutions.

##### Argon2

There's experimental argon2 RFC 9106 implementation. It may be removed at any time.

```ts
import { argon2d, argon2i, argon2id } from 'hashes-grs/scrypt';
const password = 'password';
const salt = 'salt';
const result = argon2id(password, salt, { t: 2, m: 65536, p: 1 });
```

##### ESKDF

A tiny stretched KDF for various applications like AES key-gen. Takes >= 2 seconds to execute.

Takes following params:

- `username` - username, email, or identifier, min: 8 characters, should have enough entropy
- `password` - min: 8 characters, should have enough entropy

Produces ESKDF instance that has `deriveChildKey(protocol, accountId[, options])` function.

- `protocol` - 3-15 character protocol name
- `accountId` - numeric identifier of account
- `options` - `keyLength: 32` with specified key length (default is 32),
  or `modulus: 2n ** 221n - 17n` with specified modulus. It will fetch modulus + 64 bits of
  data, execute modular division. The result will have negligible bias as per FIPS 186 B.4.1.
  Can be used to generate, for example, elliptic curve keys.

Takes username and password, then takes protocol name and account id.

```typescript
import { eskdf } from 'hashes-grs/eskdf';
const kdf = await eskdf('example@university', 'beginning-new-example');
console.log(kdf.fingerprint);
const key1 = kdf.deriveChildKey('aes', 0);
const key2 = kdf.deriveChildKey('aes', 0, { keyLength: 16 });
const ecc1 = kdf.deriveChildKey('ecc', 0, { modulus: 2n ** 252n - 27742317777372353535851937790883648493n })
kdf.expire();
```

##### utils

```typescript
import { bytesToHex as toHex, randomBytes } from 'hashes-grs/scrypt';
console.log(toHex(randomBytes(32)));
```

- `bytesToHex` will convert `Uint8Array` to a hex string
- `randomBytes(bytes)` will produce cryptographically secure random `Uint8Array` of length `bytes`

## Security

Noble is production-ready.

1. The library has been audited on Jan 5, 2022 by an independent security firm cure53: [PDF](https://cure53.de/pentest-report_hashing-libs.pdf). No vulnerabilities have been found. The audit has been funded by Ethereum Foundation with help of [Nomic Labs](https://nomiclabs.io). Modules `blake3`, `sha3-addons` and `sha1` have not been audited. See [changes since audit](https://github.com/paulmillr/noble-hashes/compare/1.0.0..main).
2. The library has been fuzzed by [Guido Vranken's cryptofuzz](https://github.com/guidovranken/cryptofuzz). You can run the fuzzer by yourself to check it.
3. [Timing attack](https://en.wikipedia.org/wiki/Timing_attack) considerations: _JIT-compiler_ and _Garbage Collector_ make "constant time" extremely hard to achieve in a scripting language. Which means _any other JS library can't have constant-timeness_. Even statically typed Rust, a language without GC, [makes it harder to achieve constant-time](https://www.chosenplaintext.ca/open-source/rust-timing-shield/security) for some cases. If your goal is absolute security, don't use any JS lib — including bindings to native ones. Use low-level libraries & languages. Nonetheless we're targetting algorithmic constant time.
4. Memory dump considerations: the library shares state buffers between hash function calls. The buffers are zeroed-out after each call. However, if an attacker can read application memory, you are doomed in any case:
    - At some point, input will be a string and strings are immutable in JS: there is no way to overwrite them with zeros. For example: deriving key from `scrypt(password, salt)` where password and salt are strings
    - Input from a file will stay in file buffers
    - Input / output will be re-used multiple times in application which means it could stay in memory
    - `await anything()` will always write all internal variables (including numbers) to memory. With async functions / Promises there are no guarantees when the code chunk would be executed. Which means attacker can have plenty of time to read data from memory
    - There is no way to guarantee anything about zeroing sensitive data without complex tests-suite which will dump process memory and verify that there is no sensitive data left. For JS it means testing all browsers (incl. mobile), which is complex. And of course it will be useless without using the same test-suite in the actual application that consumes the library

We consider infrastructure attacks like rogue NPM modules very important; that's why it's crucial to minimize the amount of 3rd-party dependencies & native bindings. If your app uses 500 dependencies, any dep could get hacked and you'll be downloading malware with every `npm install`. Our goal is to minimize this attack vector.

## Speed

Benchmarks measured on Apple M1 with macOS 12.
Note that PBKDF2 and Scrypt are tested with extremely high work factor.
To run benchmarks, execute `npm run bench:install` and then `npm run bench`

```
SHA256 32B x 1,126,126 ops/sec @ 888ns/op
SHA384 32B x 463,606 ops/sec @ 2μs/op
SHA512 32B x 467,945 ops/sec @ 2μs/op
SHA3-256, keccak256, shake256 32B x 192,049 ops/sec @ 5μs/op
Kangaroo12 32B x 318,066 ops/sec @ 3μs/op
Marsupilami14 32B x 283,929 ops/sec @ 3μs/op
BLAKE2b 32B x 352,112 ops/sec @ 2μs/op
BLAKE2s 32B x 511,770 ops/sec @ 1μs/op
BLAKE3 32B x 582,072 ops/sec @ 1μs/op
RIPEMD160 32B x 1,230,012 ops/sec @ 813ns/op
HMAC-SHA256 32B x 238,663 ops/sec @ 4μs/op
HKDF-SHA256 32B x 108,377 ops/sec @ 9μs/op
PBKDF2-HMAC-SHA256 262144 x 3 ops/sec @ 326ms/op
PBKDF2-HMAC-SHA512 262144 x 1 ops/sec @ 970ms/op
Scrypt r: 8, p: 1, n: 262144 x 1 ops/sec @ 616ms/op
```

Compare to native node.js implementation that uses C bindings instead of pure-js code:

```
SHA256 32B native x 1,164,144 ops/sec @ 859ns/op
SHA384 32B native x 938,086 ops/sec @ 1μs/op
SHA512 32B native x 946,969 ops/sec @ 1μs/op
SHA3 32B native x 879,507 ops/sec @ 1μs/op
keccak, k12, m14 are not implemented
BLAKE2b 32B native x 879,507 ops/sec @ 1μs/op
BLAKE2s 32B native x 977,517 ops/sec @ 1μs/op
BLAKE3 is not implemented
RIPEMD160 32B native x 913,242 ops/sec @ 1μs/op
HMAC-SHA256 32B native x 755,287 ops/sec @ 1μs/op
HKDF-SHA256 32B native x 207,856 ops/sec @ 4μs/op
PBKDF2-HMAC-SHA256 262144 native x 23 ops/sec @ 42ms/op
Scrypt 262144 native x 1 ops/sec @ 564ms/op
Scrypt 262144 scrypt.js x 0 ops/sec @ 1678ms/op
```

It is possible to [make this library 4x+ faster](./test/benchmark/README.md) by
_doing code generation of full loop unrolls_. We've decided against it. Reasons:

- the library must be auditable, with minimum amount of code, and zero dependencies
- most method invocations with the lib are going to be something like hashing 32b to 64kb of data
- hashing big inputs is 10x faster with low-level languages, which means you should probably pick 'em instead

The current performance is good enough when compared to other projects; SHA256 takes only 900 nanoseconds to run.

## Contributing & testing

1. Clone the repository
2. `npm install` to install build dependencies like TypeScript
3. `npm run build` to compile TypeScript code
4. `npm run test` will execute all main tests. See [our approach to testing](./test/README.md)
5. `npm run test:dos` will test against DoS; by measuring function complexity. **Takes ~20 minutes**
6. `npm run test:big` will execute hashing on 4GB inputs,
   scrypt with 1024 different `N, r, p` combinations, etc. **Takes several hours**. Using 8-32+ core CPU helps.

## License

The MIT License (MIT)

Copyright (c) 2022 Paul Miller [(https://paulmillr.com)](https://paulmillr.com)
Copyright (c) 2024 Groestlcoin Developers

See LICENSE file.
