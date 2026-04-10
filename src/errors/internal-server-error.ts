import { HttpError } from './http-error.ts';

export class InternalServerError extends HttpError {
  constructor(instance: string = '/') {
    super(
      'about:blank',
      500,
      'Internal Server Error',
      'An unexpected error occurred while processing the request.',
      instance
    );
  }
}
