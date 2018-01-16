"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql = require("graphql");
class PureError extends Error {
    constructor(name, message) {
        super(message);
        this.name = name;
    }
}
exports.PureError = PureError;
// PureError.prototype = new Error();
class BaseError extends PureError {
    constructor(name, message, status = 501) {
        super(name, message);
        this.status = status;
    }
}
exports.BaseError = BaseError;
class UnexpectedInput extends BaseError {
    constructor(message) {
        super('UnexpectedInput', message, 422);
        this.message = message;
    }
}
exports.UnexpectedInput = UnexpectedInput;
class MissMatchError extends BaseError {
    constructor(message) {
        super('MissMatchInput', message, 422);
        this.message = message;
    }
}
exports.MissMatchError = MissMatchError;
class FileFormat extends BaseError {
    constructor(message) {
        super('FileFormat', message, 422);
        this.message = message;
    }
}
exports.FileFormat = FileFormat;
// export class UnauthorizedInput extends BaseError {
//     constructor (public message: string) {
//       super('UnauthorizedInput', message, 401);
//     }
// }
class DenyError extends BaseError {
    constructor(message) {
        super('DenyError', message, 401);
        this.message = message;
    }
}
exports.DenyError = DenyError;
// export class NotFound extends BaseError {
//   constructor (public message: string) {
//     super('NotFound', message, 404);
//   }
// }
class ValidationError extends graphql.GraphQLError {
    constructor(errors) {
        super('The request is invalid.');
        this.status = 422;
        this.state = errors.reduce((result, error) => {
            if (Object.prototype.hasOwnProperty.call(result, error.key)) {
                result[error.key].push(error.message);
            }
            else {
                result[error.key] = [error.message];
            }
            return result;
        }, {});
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=Error.js.map