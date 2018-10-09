import fixtures from '../test/fixtures';
import { encoder, IBaseXEncoder } from './index';

const bases: { [key: string]: IBaseXEncoder } = {};

Object.keys(fixtures.alphabets).forEach((alphabetName) => {
  bases[alphabetName] = encoder((fixtures.alphabets as any)[alphabetName]);
});

fixtures.valid.forEach((f) => {
  test(`can encode ${f.alphabet}: ${f.hex}`, () => {
    const base = bases[f.alphabet];
    const actual = base.encodeFromBuffer(Buffer.from(f.hex, 'hex'));
    expect(actual).toBe(f.string);
  });
});

fixtures.valid.forEach((f) => {
  test(`can encode / decode ${f.alphabet}: ${f.string}`, () => {
    const base = bases[f.alphabet];
    expect(base.decode(base.encode(f.string))).toBe(f.string);
  });
});

fixtures.valid.forEach((f) => {
  test(`can decode ${f.alphabet}: ${f.string}`, () => {
    const base = bases[f.alphabet];
    const actual = base.decodeToBuffer(f.string)!.toString('hex');
    expect(actual).toBe(f.hex);
  });
});

fixtures.invalid.forEach((f) => {
  test(`decode throws on ${f.description}`, () => {
    const base = bases[f.alphabet] || (bases[f.alphabet] = encoder(f.alphabet));
    expect(base.decodeToBuffer(f.string as any)).toBe(null);
  });
});

test('decode should return Buffer', () => {
  expect(Buffer.isBuffer(bases.base2.decodeToBuffer(''))).toBe(true);
  expect(Buffer.isBuffer(bases.base2.decodeToBuffer('01'))).toBe(true);
});

test('bad alphabet', () => {
  expect(() => encoder('aa')).toThrow(/duplicate/);
});
