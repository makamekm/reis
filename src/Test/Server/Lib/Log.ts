import { getLevelNumber, isWritableLevel } from '../../../Server/Lib/Log';

describe("Server/Lib/Log", function() {
  it("getLevelNumber", function() {
    expect(3).toBe(getLevelNumber('debug'));
    expect(2).toBe(getLevelNumber('info'));
    expect(1).toBe(getLevelNumber('warn'));
    expect(0).toBe(getLevelNumber('error'));
    expect(-1).toBe(getLevelNumber('bla' as any));
  });

  it("isWritableLevel", function() {
    expect(true).toBe(isWritableLevel('debug', 'debug'));
    expect(true).toBe(isWritableLevel('info', 'info'));
    expect(true).toBe(isWritableLevel('warn', 'warn'));
    expect(true).toBe(isWritableLevel('error', 'error'));

    expect(false).toBe(isWritableLevel('debug', 'info'));
    expect(false).toBe(isWritableLevel('debug', 'warn'));
    expect(false).toBe(isWritableLevel('debug', 'error'));

    expect(true).toBe(isWritableLevel('info', 'debug'));
    expect(true).toBe(isWritableLevel('warn', 'debug'));
    expect(true).toBe(isWritableLevel('error', 'debug'));
  });
});