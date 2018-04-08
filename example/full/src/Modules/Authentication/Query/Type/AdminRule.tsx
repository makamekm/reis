import { GraphQLScalarType, Kind } from 'graphql';

import * as Validator from 'reiso/Modules/Validator';
import * as Error from 'reiso/Modules/Error';
import * as GraphQL from 'reiso/Modules/Query';

import { AdminRule, AdminRuleForEach } from '~/Modules/Authentication/Enum/AdminRule';

export const ruleAdminType = new GraphQLScalarType({
  name: 'AdminRule',
  serialize: value => value,
  parseValue: value => {
    let exist = false;

    AdminRuleForEach(rule => {
      if (value as any == rule) exist = true;
    });

    if (!exist) throw new Error.UnexpectedInput('AdminRule is not defined: ' + value);

    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.INT) {
      throw new Error.UnexpectedInput('AdminRule can only parse int got a: ' + ast.kind);
    }

    let exist = false;

    AdminRuleForEach(rule => {
      if (ast.value as any == rule) exist = true;
    });

    if (!exist) throw new Error.UnexpectedInput('AdminRule is not defined: ' + ast.value);

    return ast.value;
  }
});