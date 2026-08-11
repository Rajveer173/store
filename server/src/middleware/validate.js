import { ApiError } from '../utils/ApiError.js';

function formatIssues(error) {
  return error.issues.reduce((accumulator, issue) => {
    const field = issue.path.join('.') || 'form';
    if (!accumulator[field]) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return next(ApiError.badRequest('Validation failed', formatIssues(result.error)));
    }
    req.body = result.data;
    return next();
  };
}

export function validateParams(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params ?? {});
    if (!result.success) {
      return next(ApiError.badRequest('Validation failed', formatIssues(result.error)));
    }
    req.validatedParams = result.data;
    return next();
  };
}
