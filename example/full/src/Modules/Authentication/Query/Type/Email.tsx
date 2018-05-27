import { GraphQLScalarType, Kind } from 'graphql';
import * as GraphQL from 'reiso/Modules/Query';

import Code from '../../../../Export/Code';
import { emailValidator } from '../../../../Global/Validator';
import { InputError, ValidationError } from '../../../../Global/Error';

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
      throw new InputError(null, 'Email can only parse strings got a: ' + ast.kind, Code.EmailInputWrong);
    }

    let errors = emailValidator(ast.value, {
      nullable: true
    });

    if(errors.length) {
      throw new ValidationError(null, null, Code.EmailInputWrong, errors.map(i => ({
        key: 'Email',
        message: i
      })));
    }

    return ast.value;
  }
});