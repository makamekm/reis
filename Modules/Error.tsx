export class LogError extends Error {
  public status: number;
  public title: string;
  public code: string;
  public level: string;

  constructor (title: string, level: 'info' | 'warn' | 'debug' | 'error', message: any, code?: string, status: number = 501) {
    super(message);
    this.title = title;
    this.code = code;
    this.status = status;
    this.level = level;
  }
}