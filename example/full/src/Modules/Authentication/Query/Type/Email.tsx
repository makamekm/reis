import { GraphQLScalarType, Kind } from 'graphql';

import * as Validator from 'reiso/Modules/Validator';
import * as Error from 'reiso/Modules/Error';
import * as GraphQL from 'reiso/Modules/Query';

export const emailType = new GraphQLScalarType({
  name: 'Email',
  serialize: value => {
    return value;
  },
  parseValue: value => {
    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new Error.UnexpectedInput('Email can only parse strings got a: ' + ast.kind);
    }

    let errors = Validator.emailValidator(ast.value, {
      nullable: true
    });

    if(errors.length) {
      throw new Error.ValidationError(errors.map(i => ({
        key: 'Email',
        message: i
      })));
    }

    return ast.value;
  }
});