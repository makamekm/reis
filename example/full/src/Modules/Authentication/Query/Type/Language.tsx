import { GraphQLScalarType, Kind } from 'graphql';

import * as Validator from '~/Global/Validator';
import { InputError } from '~/Global/Error';
import * as GraphQL from 'reiso/Modules/Query';

import { Language, LanguageForEach, LanguageCode } from '~/Modules/Language/Enum/Language';

export const languageType = new GraphQLScalarType({
  name: 'Language',
  serialize: value => value,
  parseValue: value => {
    let exist = false;

    LanguageForEach(language => {
      if (value as any == language) exist = true;
    });

    if (!exist) throw new InputError(null, `Language is not defined: ${value}`, "V3");

    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.INT) {
      throw new InputError(null, `Language can only parse int got a: ${ast.kind}`, "V3");
    }

    let exist = false;

    // LanguageForEach(language => {
    //   if (ast.value as any == language) exist = true;
    // });

    if (!exist) throw new InputError(null, `Language is not defined: ${ast.value}`, "V3");

    return ast.value;
  }
});