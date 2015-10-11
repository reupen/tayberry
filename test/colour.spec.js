var Colour = require('../src/colour').Colour;

describe('babelBp', () => {
  describe('Greet function', () => {
    beforeEach(() => {

    });

    it('parses a 3 char hex html colour correctly', () => {
      let colour = new Colour('#111');
      expect(colour.r).toBe(0x11);
      expect(colour.g).toBe(0x11);
      expect(colour.b).toBe(0x11);
    });

  });
});
