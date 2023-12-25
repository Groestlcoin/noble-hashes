import { wrapConstructor } from './utils.js';
import { GROESTL } from './_groestl512';

// This needs to have it such that it saves the first 32 bytes only

export class GROESTL256 extends GROESTL<GROESTL256> {
  constructor() {
    super(32, 128, false);
  }

  protected process(view: DataView, offset: number) {
    view.byteLength;
    offset;
  }
  protected roundClean() {}
  destroy() {}
}

export const groestl256 = /* @__PURE__ */ wrapConstructor(() => new GROESTL256());
