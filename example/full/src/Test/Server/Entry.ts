import fs = require('fs');
import path = require('path');
// import $ = require('jquery');

describe("A suite", function() {
  it("contains spec with an expectation", function() {
    const r: number = 25;
    expect(5 * 5).toBe(r);
  });
});