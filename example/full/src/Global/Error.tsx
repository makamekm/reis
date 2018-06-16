import * as graphql from 'graphql';
import { LogError } from 'reiso/Modules/Error';

import Code from '../Export/Code';

export class InputError extends LogError {
  constructor (title: string, message: any, code: string, status: number = 422) {
    super(title, 'debug', message, code, status);
  }
}

export class DenyError extends LogError {
  constructor (title: string, message: any, code: string = Code.DenyAccess, status: number = 401) {
    super(title, 'debug', message, code, status);
  }
}

export class ValidationError extends graphql.GraphQLError {
  status: number = 422
  title: string
  code: string
  level: string = 'debug'
  state: {
    [key: string]: string[]
  }

  constructor(title: string, message: any, code: string, errors: {
    key: string
    message: string
  }[]) {
    super(message);
    this.title = title;
    this.code = code;

    this.state = errors.reduce((result, error) => {
      if (Object.prototype.hasOwnProperty.call(result, error.key)) {
        result[error.key].push(error.message);
      } else {
        result[error.key] = [error.message];
      }
      return result;
    }, {});
  }
}