import fs = require('fs');
import path = require('path');
require('tsconfig-paths/register');

describe("A suite", function() {
  it("contains spec with an expectation", function() {
    const r: number = 25;
    expect(5 * 5).toBe(r);
  });
});