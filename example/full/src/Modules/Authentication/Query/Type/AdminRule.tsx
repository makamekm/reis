import { GraphQLScalarType, Kind } from 'graphql';

import * as GraphQL from 'reiso/Modules/Query';

import Code from '~/Export/Code';
import { InputError } from '~/Global/Error';
import { AdminRule, AdminRuleForEach } from '~/Modules/Authentication/Enum/AdminRule';

export const ruleAdminType = new GraphQLScalarType({
  name: 'AdminRule',
  serialize: value => value,
  parseValue: value => {
    let exist = false;

    AdminRuleForEach(rule => {
      if (value as any == rule) exist = true;
    });

    if (!exist) throw new InputError(null, 'AdminRule is not defined: ' + value, Code.AdminRuleInputWrong);

    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.INT) {
      throw new InputError(null, 'AdminRule can only parse int got a: ' + ast.kind, Code.AdminRuleInputWrong);
    }

    let exist = false;

    AdminRuleForEach(rule => {
      if (ast.value as any == rule) exist = true;
    });

    if (!exist) throw new InputError(null, 'AdminRule is not defined: ' + ast.value, Code.AdminRuleInputWrong);

    return ast.value;
  }
});