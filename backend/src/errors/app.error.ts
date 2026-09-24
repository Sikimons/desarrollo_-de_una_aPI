import type { ApiErrorDetail } from '../utils/response-wrapper.js';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errors: ApiErrorDetail[] | null = null,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
