import { GraphQLScalarType, Kind } from 'graphql';

import * as GraphQL from 'reiso/Modules/Query';

import Code from '../../../../Export/Code';
import { InputError } from '../../../../Global/Error';
import { UserRule, UserRuleForEach } from '../../Enum/UserRule';

export const ruleUserType = new GraphQLScalarType({
  name: 'UserRule',
  serialize: value => value,
  parseValue: value => {
    let exist = false;

    UserRuleForEach(rule => {
      if (value as any == rule) exist = true;
    });

    if (!exist) throw new InputError(null, 'UserRule is not defined: ' + value, Code.UserRuleInputWrong);

    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.INT) {
      throw new InputError(null, 'UserRule can only parse int got a: ' + ast.kind, Code.UserRuleInputWrong);
    }

    let exist = false;

    UserRuleForEach(rule => {
      if (ast.value as any == rule) exist = true;
    });

    if (!exist) throw new InputError(null, 'UserRule is not defined: ' + ast.value, Code.UserRuleInputWrong);

    return ast.value;
  }
});