import { GraphQLEnumType, GraphQLScalarType, Kind } from 'graphql';
import * as GraphQL from 'reiso/Modules/Query';

import Code from '../Export/Code';
import { BaseError, ValidationError } from './Error';
import * as Validator from './Validator';

export let orderEnum = new GraphQLEnumType({
  name: 'OrderEnum',
  values: {
    desc: { value: 'DESC' },
    asc: { value: 'ASC' },
  }
});

export const uploadType = new GraphQLScalarType({
  name: 'Upload',
  serialize: value => {
    return value;
  },
  parseValue: value => {
    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new BaseError(null, 'Upload can only parse strings got a: ' + ast.kind, Code.FileInputWrong, 422);
    }

    let errors = Validator.stringValidator(ast.value, {
      min: 3,
      max: 100,
      nullable: true
    });

    if (errors.length) {
      throw new ValidationError(null, null, Code.FileInputWrong, errors.map(i => ({
        key: 'Upload',
        message: i
      })));
    }

    return ast.value;
  }
});

export const colorType = new GraphQLScalarType({
  name: 'Color',
  serialize: value => {
    return value;
  },
  parseValue: value => {
    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new BaseError(null, 'Color can only parse strings got a: ' + ast.kind, Code.ColorInputWrong, 422);
    }

  let errors = Validator.colorValidator(ast.value, {
    nullable: true
  });

  if (errors.length) {
    throw new ValidationError(null, null, Code.ColorInputWrong, errors.map(i => ({
      key: 'Color',
      message: i
    })));
  }

    return ast.value;
  }
});

export const dateType = new GraphQLScalarType({
  name: 'Date',

  serialize: (value: Date) => value.toUTCString(),

  parseValue: value => {
    return Date.parse(value);
  },

  parseLiteral: ast => {
    if (ast.kind !== Kind.STRING) {
      throw new BaseError(null, 'Date can only parse strings got a: ' + ast.kind, Code.DateInputWrong, 422);
    }

    let errors = Validator.dateValidator(ast.value, {
      nullable: true
    });

    if (errors.length) {
      throw new ValidationError(null, null, Code.DateInputWrong, errors.map(i => ({
        key: 'Date',
        message: i
      })));
    }

    return ast.value;
  }
});