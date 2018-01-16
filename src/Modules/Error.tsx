import * as graphql from 'graphql';

export class PureError extends Error {
  name: string;

  constructor (name: string, message: any) {
    super(message);
    this.name = name;
  }
}

// PureError.prototype = new Error();

export class BaseError extends PureError {
  public name: string;
  public status: number;

  constructor (name: string, message: any, status: number = 501) {
    super(name, message);
    this.status = status;
  }
}

export class UnexpectedInput extends BaseError {
  constructor (public message: string) {
    super('UnexpectedInput', message, 422);
  }
}

export class MissMatchError extends BaseError {
  constructor (public message: string) {
    super('MissMatchInput', message, 422);
  }
}

export class FileFormat extends BaseError {
  constructor (public message: string) {
    super('FileFormat', message, 422);
  }
}

// export class UnauthorizedInput extends BaseError {
//     constructor (public message: string) {
//       super('UnauthorizedInput', message, 401);
//     }
// }

export class DenyError extends BaseError {
  constructor (public message: string) {
    super('DenyError', message, 401);
  }
}

// export class NotFound extends BaseError {
//   constructor (public message: string) {
//     super('NotFound', message, 404);
//   }
// }

export class ValidationError extends graphql.GraphQLError {
  status: number = 422;
  state: {
    [key: string]: string[]
  }

  constructor(errors: {
    key: string
    message: string
  }[]) {
    super('The request is invalid.');

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