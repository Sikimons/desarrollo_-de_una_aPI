import type { Response } from 'express';

export interface ApiErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiErrorDetail[] | null;
  timestamp: string;
}

export class ResponseWrapper {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T,
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      errors: null,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    errors: ApiErrorDetail[] | null = null,
  ): Response<ApiResponse<never>> {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
