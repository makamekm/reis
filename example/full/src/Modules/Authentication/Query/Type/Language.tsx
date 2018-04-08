import { GraphQLScalarType, Kind } from 'graphql';

import * as Validator from 'reiso/Modules/Validator';
import * as Error from 'reiso/Modules/Error';
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

    if (!exist) throw new Error.UnexpectedInput('Language is not defined: ' + value);

    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.INT) {
      throw new Error.UnexpectedInput('Language can only parse int got a: ' + ast.kind);
    }

    let exist = false;

    // LanguageForEach(language => {
    //   if (ast.value as any == language) exist = true;
    // });

    if (!exist) throw new Error.UnexpectedInput('Language is not defined: ' + ast.value);

    return ast.value;
  }
});