import { Response } from "express";

export class HTTPResponse {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T
  ) {
    return res
      .status(statusCode)
      .json({ success: true, message: message, data: data });
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    errorDetails?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      message: message,
      error: errorDetails ?? null,
    });
  }
}
