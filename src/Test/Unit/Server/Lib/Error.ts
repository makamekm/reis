//require('tsconfig-paths/register');
import { genMessage, getSerialized, getApmError } from '../../../../Server/Lib/Error';

describe("Server/Lib/Error", function() {
  it("genMessage", function() {
    const r = genMessage({
      a: ['b'],
      c: ['d', 'e']
    });
    expect('a: b; c: d, e').toBe(r);
  });

  it("getSerialized", function() {
    const error = {
      originalError: new Error('Test'),
      message: 'TestTest',
      graphQLErrors: [
        {
          message: 'TestTestTest'
        }
      ]
    };
    const r = getSerialized(error, 'test', (e, type) => getSerialized(e, type, e => e));
    expect('TestTest').toBe(r.message);
    expect('Error').toBe(r.type);
    expect('TestTestTest').toBe(r.errors[0].message);
  });

  it("getApmError", function() {
    const error = {
      originalError: new Error('Test'),
      message: 'TestTest',
      graphQLErrors: [
        {
          message: 'TestTestTest'
        }
      ]
    };
    const [apmError, apmAdditional] = getApmError(error, 'test');
    expect('Test').toBe(apmError.message);
    expect('test').toBe(apmAdditional.typeResponse);
    expect('Error').toBe(apmAdditional.errorType as string);
    expect('Error').toBe(apmAdditional.type as string);
  });
});