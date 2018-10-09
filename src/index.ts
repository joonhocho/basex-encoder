// tslint:disable no-bitwise
// base-x encoding
// Forked from https://github.com/cryptocoinjs/base-x
// Forked from https://github.com/cryptocoinjs/bs58
// Originally written by Mike Hearn for BitcoinJ
// Copyright (c) 2011 Google Inc
// Ported to JavaScript by Stefan Thomas
// Merged Buffer refactorings from base58-native by Stephen Pair
// Copyright (c) 2013 BitPay Inc
export interface IBaseXEncoder {
  encode: (str: string, encoding?: string) => string;
  encodeFromBuffer: (source: Buffer) => string;
  decode: (encoded: string, encoding?: string) => string | null;
  decodeToBuffer: (str: string) => Buffer | null;
}

export const encoder = (
  ALPHABET: string,
  defaultEncoding = 'utf8'
): IBaseXEncoder => {
  const ALPHABET_MAP: { [key: string]: number } = {};
  const BASE = ALPHABET.length;
  const LEADER = ALPHABET.charAt(0);

  // pre-compute lookup table
  for (let z = 0; z < ALPHABET.length; z += 1) {
    const x = ALPHABET.charAt(z);
    if (ALPHABET_MAP[x] !== undefined) {
      throw new TypeError(`'${x}' is duplicate!`);
    }
    ALPHABET_MAP[x] = z;
  }

  const encodeFromBuffer = (source: Buffer): string => {
    const sourceLen = source.length;
    if (sourceLen === 0) {
      return '';
    }

    const digits = [0];
    for (let i = 0; i < sourceLen; i += 1) {
      let carry = source[i];
      const digitsLen = digits.length;
      for (let j = 0; j < digitsLen; j += 1) {
        carry += digits[j] << 8;
        digits[j] = carry % BASE;
        carry = (carry / BASE) | 0;
      }

      while (carry > 0) {
        digits.push(carry % BASE);
        carry = (carry / BASE) | 0;
      }
    }

    let str = '';
    const lastSourceIndex = sourceLen - 1;
    // deal with leading zeros
    for (let k = 0; source[k] === 0 && k < lastSourceIndex; k += 1) {
      str += LEADER;
    }

    // convert digits to a string
    for (let q = digits.length - 1; q >= 0; q -= 1) {
      str += ALPHABET[digits[q]];
    }

    return str;
  };

  const decodeToBuffer = (encoded: string): Buffer | null => {
    if (encoded.length === 0) {
      return Buffer.allocUnsafe(0);
    }

    const bytes = [0];
    const strLen = encoded.length;
    for (let i = 0; i < strLen; i += 1) {
      const value = ALPHABET_MAP[encoded[i]];
      if (value === undefined) {
        return null;
      }

      let carry = value;
      const bytesLen = bytes.length;

      for (let j = 0; j < bytesLen; j += 1) {
        carry += bytes[j] * BASE;
        bytes[j] = carry & 0xff;
        carry >>= 8;
      }

      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }

    // deal with leading zeros
    const lastStrIndex = encoded.length - 1;
    for (let k = 0; encoded[k] === LEADER && k < lastStrIndex; k += 1) {
      bytes.push(0);
    }

    return Buffer.from(bytes.reverse());
  };

  const encode = (str: string, encoding = defaultEncoding): string =>
    encodeFromBuffer(Buffer.from(str, encoding));

  const decode = (
    encoded: string,
    encoding = defaultEncoding
  ): string | null => {
    const buffer = decodeToBuffer(encoded);
    return buffer && buffer.toString(encoding);
  };

  return {
    encode,
    decode,
    encodeFromBuffer,
    decodeToBuffer,
  };
};
