import HTTP from "../constants/http.responses";

export class BaseError extends Error {
  statusCode: HTTP;
  isOperational: boolean;
  constructor(
    name: string,
    message: string,
    statusCode: HTTP,
    isOperational: boolean
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

class ApiError extends BaseError {
  constructor(statusCode: HTTP, message: string) {
    super("ApiError", message, statusCode, true);
  }
}

export default ApiError
