import { GraphQLScalarType, Kind } from 'graphql';
import * as GraphQL from 'reiso/Modules/Query';

import Code from '~/Export/Code';
import { stringValidator } from '~/Global/Validator';
import { InputError, ValidationError } from '~/Global/Error';

export const usernameType = new GraphQLScalarType({
  name: 'Username',
  serialize: value => {
    return value;
  },
  parseValue: value => {
    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new InputError(null, 'Username can only parse strings got a: ' + ast.kind, Code.UsernameInputWrong);
    }

    let errors = stringValidator(ast.value, {
      min: 3,
      max: 20,
      nullable: true
    });

    if (errors.length) {
      throw new ValidationError(null, null, Code.UsernameInputWrong, errors.map(i => ({
        key: 'Username',
        message: i
      })));
    }

    return ast.value;
  }
});

export const passwordType = new GraphQLScalarType({
  name: 'Password',
  serialize: value => {
    return value;
  },
  parseValue: value => {
    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new InputError(null, 'Password can only parse strings got a: ' + ast.kind, Code.PasswordInputWrong);
    }

    let errors = stringValidator(ast.value, {
      min: 3,
      max: 20,
      nullable: true
    });

    if (errors.length) {
      throw new ValidationError(null, null, Code.PasswordInputWrong, errors.map(i => ({
        key: 'Password',
        message: i
      })));
    }

    return ast.value;
  },
});