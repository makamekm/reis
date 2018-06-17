import { reduce, parseEnv } from '../../../../Server/Lib/Config';

describe("Server/Lib/Config", function () {
  const translation = {
    "Test1": {
      "Test1Test1": {
        "en": "Test1Test1Test1",
        "ru": "Test1Test1Test2"
      },
      "Test1Test2": {
        "Test1Test2Test1": {
          "en": "Test1Test2Test1Test1",
          "ru": "Test1Test2Test1Test2"
        }
      }
    },
    "Test2": {
      "Test2Test1": {
        "en": "Test2Test1Test1",
        "ru": "Test2Test1Test2"
      },
      "Test2Test2": {
        "en": "Test2Test2Test1",
        "ru": "Test2Test2Test2"
      }
    }
  };

  it("reduce - en", function () {
    expect(JSON.stringify({
      "Test1": {
        "Test1Test1": "Test1Test1Test1",
        "Test1Test2": {
          "Test1Test2Test1": "Test1Test2Test1Test1"
        }
      },
      "Test2": {
        "Test2Test1": "Test2Test1Test1",
        "Test2Test2": "Test2Test2Test1"
      }
    })).toBe(JSON.stringify(reduce('en', translation)));
  });

  it("reduce - ru", function () {
    expect(JSON.stringify({
      "Test1": {
        "Test1Test1": "Test1Test1Test2",
        "Test1Test2": {
          "Test1Test2Test1": "Test1Test2Test1Test2"
        }
      },
      "Test2": {
        "Test2Test1": "Test2Test1Test2",
        "Test2Test2": "Test2Test2Test2"
      }
    })).toBe(JSON.stringify(reduce('ru', translation)));
  });

  it("parseEnv", function () {
    process.env = Object.assign(process.env, {
      "TEST1": "t1t1",
      "TEST2": "123"
    });

    expect('{"Test1": "t1t1", "Test2": 123, "Test3": 111}').toBe(parseEnv('{"Test1": "${TEST1}", "Test2": ${TEST2}, "Test3": ${TEST3:111}}'));
  });
});