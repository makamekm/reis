import $ = require('jquery');

describe("A suite", async () => {
  it("contains spec with an expectation", async () => {
    const r: number = 25;
    await new Promise(r => setTimeout(r, 500));
    expect(5 * 5).toBe(r);
  });

  it("contains spec with an expectation", async () => {
    const r: number = 25;
    await new Promise(r => setTimeout(r, 500));
    expect(5 * 5).toBe(r);
  });
});