import { GraphQLScalarType, Kind } from 'graphql';

import * as Validator from 'reiso/Modules/Validator';
import * as Error from 'reiso/Modules/Error';
import * as GraphQL from 'reiso/Modules/Query';

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
      throw new Error.UnexpectedInput('Username can only parse strings got a: ' + ast.kind);
    }

    let errors = Validator.stringValidator(ast.value, {
      min: 3,
      max: 20,
      nullable: true
    });

    if (errors.length) {
      throw new Error.ValidationError(errors.map(i => ({
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
      throw new Error.UnexpectedInput('Password can only parse strings got a: ' + ast.kind);
    }

    let errors = Validator.stringValidator(ast.value, {
      min: 3,
      max: 20,
      nullable: true
    });

    if (errors.length) {
      throw new Error.ValidationError(errors.map(i => ({
        key: 'Password',
        message: i
      })));
    }

    return ast.value;
  },
});