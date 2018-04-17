import fs = require('fs');
import path = require('path');
// import $ = require('jquery');

describe("A suite", function() {
  it("contains spec with an expectation", function() {
    const r: number = 25;
    expect(5 * 5).toBe(r);
  });
});

describe("B file", function() {
  it("contains spec with an expectation", function() {
    expect(fs.existsSync(path.resolve(__dirname, 'reiso.json'))).toBe(true);
  });
});