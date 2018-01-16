"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
tslib_1.__exportStar(require("../Server/Query"), exports);
const Error = require("./Error");
const Validator = require("./Validator");
exports.orderEnum = new graphql_1.GraphQLEnumType({
    name: 'OrderEnum',
    values: {
        desc: { value: 'DESC' },
        asc: { value: 'ASC' },
    }
});
exports.uploadType = new graphql_1.GraphQLScalarType({
    name: 'Upload',
    serialize: value => {
        return value;
    },
    parseValue: value => {
        return value;
    },
    parseLiteral: ast => {
        if (ast.kind !== graphql_1.Kind.STRING) {
            throw new Error.UnexpectedInput('Upload can only parse strings got a: ' + ast.kind);
        }
        let errors = Validator.stringValidator(ast.value, {
            min: 3,
            max: 100,
            nullable: true
        });
        if (errors.length) {
            throw new Error.ValidationError(errors.map(i => ({
                key: 'Upload',
                message: i
            })));
        }
        return ast.value;
    }
});
exports.colorType = new graphql_1.GraphQLScalarType({
    name: 'Color',
    serialize: value => {
        return value;
    },
    parseValue: value => {
        return value;
    },
    parseLiteral: ast => {
        if (ast.kind !== graphql_1.Kind.STRING) {
            throw new Error.UnexpectedInput('Color can only parse strings got a: ' + ast.kind);
        }
        let errors = Validator.colorValidator(ast.value, {
            nullable: true
        });
        if (errors.length) {
            throw new Error.ValidationError(errors.map(i => ({
                key: 'Color',
                message: i
            })));
        }
        return ast.value;
    }
});
exports.dateType = new graphql_1.GraphQLScalarType({
    name: 'Date',
    serialize: (value) => value.toUTCString(),
    parseValue: value => {
        return Date.parse(value);
    },
    parseLiteral: ast => {
        if (ast.kind !== graphql_1.Kind.STRING) {
            throw new Error.UnexpectedInput('Date can only parse strings got a: ' + ast.kind);
        }
        let errors = Validator.dateValidator(ast.value, {
            nullable: true
        });
        if (errors.length) {
            throw new Error.ValidationError(errors.map(i => ({
                key: 'Date',
                message: i
            })));
        }
        return ast.value;
    }
});
//# sourceMappingURL=Query.js.map