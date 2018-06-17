import { distinct } from '../../../../Server/Lib/String';

describe("Server/Lib/String", function() {
  it("distinct", function() {
    expect(JSON.stringify(['a', 'b', 'c', 't', 'y'])).toBe(JSON.stringify(distinct(['a', 'b', 'c', 'b', 'a', 't', 't', 'y'])));
  });
});