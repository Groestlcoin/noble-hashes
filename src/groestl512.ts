import { wrapConstructor } from './utils.js';
import { GROESTL } from './_groestl512';

export class GROESTL512 extends GROESTL<GROESTL512> {
  constructor() {
    super(64, 128, false);
  }

  protected process(view: DataView, offset: number) {
    view.byteLength;
    offset;
  }
  protected roundClean() {}
  destroy() {}
}

export const groestl512 = /* @__PURE__ */ wrapConstructor(() => new GROESTL512());
