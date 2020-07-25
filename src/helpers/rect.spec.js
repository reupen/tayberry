/*eslint-env jasmine */

import { Rect } from './rect';

describe('rect', () => {
  beforeEach(() => {});

  it('constructs a rect from an object correctly', () => {
    let rect = new Rect({
      left: 100,
      top: 200,
      right: 300,
      bottom: 400,
    });
    expect(rect.left).toBe(100);
    expect(rect.top).toBe(200);
    expect(rect.right).toBe(300);
    expect(rect.bottom).toBe(400);
  });

  it('constructs a rect from separate arguments correctly', () => {
    let rect = new Rect(100, 200, 300, 400);
    expect(rect.left).toBe(100);
    expect(rect.top).toBe(200);
    expect(rect.right).toBe(300);
    expect(rect.bottom).toBe(400);
  });

  it('calculates widths and heights properly', () => {
    let rect = new Rect({
      left: 100,
      top: 200,
      right: 300,
      bottom: 600,
    });
    expect(rect.width).toBe(200);
    expect(rect.height).toBe(400);
  });

  it('swaps rect sides properly', () => {
    let rect = new Rect({
      left: 100,
      top: 200,
      right: 300,
      bottom: 400,
    });
    rect.swapXY();
    expect(rect.left).toBe(200);
    expect(rect.top).toBe(100);
    expect(rect.right).toBe(400);
    expect(rect.bottom).toBe(300);
  });
});
