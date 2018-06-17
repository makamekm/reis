import { processUrl } from '../../../../Server/Lib/Url';

describe("Server/Lib/Url", function() {
  it("processUrl", function() {
    expect('tttser/sdfdsf').toBe(processUrl("http://test.ru/tttser/sdfdsf"));
  });
});