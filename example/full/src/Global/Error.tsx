import * as graphql from 'graphql';

import Code from '../Export/Code';

export class BaseError extends Error {
  public status: number;
  public title: string;
  public code: string;

  constructor (title: string, message: any, code: string, status: number = 501) {
    super(message);
    this.title = title;
    this.code = code;
    this.status = status;
  }
}

export class InputError extends BaseError {
  constructor (title: string, message: any, code: string, status: number = 422) {
    super(title, message, code, status);
  }
}

export class DenyError extends BaseError {
  constructor (title: string, message: any, code: string = Code.DenyAccess, status: number = 401) {
    super(title, message, code, status);
  }
}

export class ValidationError extends graphql.GraphQLError {
  status: number = 422;
  title: string;
  code: string;
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