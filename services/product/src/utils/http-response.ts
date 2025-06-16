import { Response } from "express";

export const HTTPResponse = {
  ok<T>(res: Response, message: string, data: T) {
    return res.status(200).json({ success: true, message, data });
  },

  badRequest<T>(res: Response, message = "Bad Request", errorDetails?: T) {
    return res.status(400).json({ success: false, message, errorDetails });
  },

  notFound<T>(res: Response, message = "Not found", errorDetails?: T) {
    return res.status(404).json({ success: false, message, errorDetails });
  },

  internalServerError<T>(
    res: Response,
    message = "Internal Server Error",
    errorDetails?: T
  ) {
    return res.status(500).json({ success: false, message, errorDetails });
  },
};
