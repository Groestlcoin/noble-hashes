import { exists, output } from './_assert.js';
import { Hash, createView, Input /*, toBytes*/ } from './utils.js';
// @ts-ignore
import { groestlSingle, groestlClose } from './groestl';
// @ts-ignore
import { u64, u } from './op.js';
//import o from "./op";

export class GroestlContext {
  public state: Array<u64>; // = new Array<u64>();
  public ptr: number; // = 0;
  public count: u64; // = u(0, 0);
  public buffer: Array<u64>; // = new Array<u64>();

  constructor() {
    this.state = new Array(16);
    for (let i = 0; i < 15; i++) {
      this.state[i] = new u64(0, 0);
    }
    this.state[15] = new u64(0, 512);
    this.ptr = 0;
    this.count = new u64(0, 0);
    this.buffer = new Array(128);
  }
}

function u64ArrayToUint8Array(
  u64Array: number[],
  uint8Array: Uint8Array,
  size: number
): Uint8Array {
  // this is not correct
  u64Array.forEach((u64Val, index) => {
    if (index < size) {
      const baseIndex = index * 4;
      uint8Array[baseIndex] = (u64Val >>> 24) & 0xff;
      uint8Array[baseIndex + 1] = (u64Val >>> 16) & 0xff;
      uint8Array[baseIndex + 2] = (u64Val >>> 8) & 0xff;
      uint8Array[baseIndex + 3] = u64Val & 0xff;
    }
  });

  return uint8Array;
}

function createUint8Array(input: Uint8Array | string): Uint8Array {
  if (input instanceof Uint8Array) {
    // If the input is already a Uint8Array, return it as is
    return input;
  } else if (typeof input === 'string') {
    // If the input is a string, assume it's a hexadecimal string and convert it
    const bytes = new Uint8Array(input.length / 2);
    for (let i = 0, c = 0; c < input.length; i++, c += 2) {
      bytes[i] = parseInt(input.substr(c, 2), 16);
    }
    return bytes;
  } else {
    throw new Error('Input must be a Uint8Array or a hexadecimal string');
  }
}

// Base SHA2 class (RFC 6234)
export abstract class GROESTL<T extends GROESTL<T>> extends Hash<T> {
  protected abstract process(buf: DataView, offset: number): void;
  abstract destroy(): void;
  protected abstract roundClean(): void;
  // For partial updates less than block size
  protected buffer: Uint8Array;
  protected view: DataView;
  protected finished = false;
  protected length = 0;
  protected pos = 0;
  protected destroyed = false;
  public blockLen: number;
  protected ctx: GroestlContext;

  constructor(public outputLen: number, readonly padOffset: number, readonly isLE: boolean) {
    super();
    this.blockLen = 128;
    this.outputLen = outputLen;
    this.buffer = new Uint8Array(this.blockLen);
    this.view = createView(this.buffer);
    this.ctx = new GroestlContext();
  }
  update(data: Input): this {
    exists(this);
    const newData = createUint8Array(data.slice());
    groestlSingle(this.ctx, newData, data.length);

    // const { view, buffer, blockLen } = this;
    // data = toBytes(data);
    // const len = data.length;
    // for (let pos = 0; pos < len; ) {
    //   const take = Math.min(blockLen - this.pos, len - pos);
    //   // Fast path: we have at least one block in input, cast it to view and process
    //   if (take === blockLen) {
    //     const dataView = createView(data);
    //     for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
    //     continue;
    //   }
    //   buffer.set(data.subarray(pos, pos + take), this.pos);
    //   this.pos += take;
    //   pos += take;
    //   if (this.pos === blockLen) {
    //     this.process(view, 0);
    //     this.pos = 0;
    //   }
    // }
    // this.length += data.length;
    // this.roundClean();
    return this;
  }
  digestInto(out: Uint8Array) {
    exists(this);
    output(out, this);

    this.finished = true;
    const finalized = groestlClose(this.ctx);
    u64ArrayToUint8Array(finalized, out, this.outputLen);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to?: T): T {
    to ||= new (this.constructor as any)() as T;
    to.ctx = new GroestlContext();
    to.ctx.state = this.ctx.state.map((u64val) => new u64(u64val.lo, u64val.hi));
    to.ctx.ptr = this.ctx.ptr;
    to.ctx.count = this.ctx.count;
    to.ctx.buffer = this.ctx.buffer.map((u64val) => new u64(u64val.lo, u64val.hi));

    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.length = length;
    to.pos = pos;
    to.finished = finished;
    to.destroyed = destroyed;
    if (length % blockLen) to.buffer.set(buffer);
    return to;
  }
}
