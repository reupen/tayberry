/*eslint-env jasmine */

import { Colour } from './colour';

describe('colours', () => {
  beforeEach(() => {});

  it('parses a 3 char hex html colour correctly', () => {
    let colour = new Colour('#111');
    expect(colour.r).toBe(0x11);
    expect(colour.g).toBe(0x11);
    expect(colour.b).toBe(0x11);
    expect(colour.a).toBe(1.0);
  });

  it('parses a 6 char hex html colour correctly', () => {
    let colour = new Colour('#111111');
    expect(colour.r).toBe(0x11);
    expect(colour.g).toBe(0x11);
    expect(colour.b).toBe(0x11);
    expect(colour.a).toBe(1.0);
  });

  it('parses an rgb html colour correctly', () => {
    let colour = new Colour('rgb(1,12,123)');
    expect(colour.r).toBe(1);
    expect(colour.g).toBe(12);
    expect(colour.b).toBe(123);
    expect(colour.a).toBe(1.0);
  });

  it('parses an rgba html colour correctly', () => {
    let colour = new Colour('rgba(1,12,123,0.5)');
    expect(colour.r).toBe(1);
    expect(colour.g).toBe(12);
    expect(colour.b).toBe(123);
    expect(colour.a).toBe(0.5);
  });

  it("doesn't care about spaces in rgb codes", () => {
    let colour = new Colour('rgba(   1,  12,   123,   0.5  )');
    expect(colour.r).toBe(1);
    expect(colour.g).toBe(12);
    expect(colour.b).toBe(123);
    expect(colour.a).toBe(0.5);
  });

  it('throws an exception on an invalid rgb colour', () => {
    expect(() => {
      new Colour('rgba(1,2)');
    }).toThrow();
  });

  it('throws an exception on an invalid hex colour', () => {
    expect(() => {
      new Colour('#12');
    }).toThrow();
  });
});
