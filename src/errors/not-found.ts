import { HttpError } from './http-error.js';

export class NotFound extends HttpError {
  constructor(instance: string = '/') {
    super(
      'about:blank',
      404,
      'Not Found',
      'The requested resource was not found on this server.',
      instance
    );
  }
}
