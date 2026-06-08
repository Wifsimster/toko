// Minimal ambient types for the subset of `aes-js` we use (the package ships
// no type definitions). See src/lib/secure-persister.ts.
declare module "aes-js" {
  class Counter {
    constructor(iv: Uint8Array | number);
  }
  namespace ModeOfOperation {
    class ctr {
      constructor(key: Uint8Array, counter: Counter);
      encrypt(data: Uint8Array): Uint8Array;
      decrypt(data: Uint8Array): Uint8Array;
    }
  }
  namespace utils {
    namespace hex {
      function toBytes(text: string): Uint8Array;
      function fromBytes(bytes: Uint8Array): string;
    }
    namespace utf8 {
      function toBytes(text: string): Uint8Array;
      function fromBytes(bytes: Uint8Array): string;
    }
  }
  const _default: {
    Counter: typeof Counter;
    ModeOfOperation: typeof ModeOfOperation;
    utils: typeof utils;
  };
  export default _default;
}
