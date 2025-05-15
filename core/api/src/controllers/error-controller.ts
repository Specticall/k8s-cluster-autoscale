import { IS_PRODUCTION } from "../config/config";
import { AppError } from "../utils/http/app-error";
import { ErrorRequestHandler } from "express";

/**
 * Error Handling middleware
 */
const errorHandler: ErrorRequestHandler = async (
  error: AppError | Error,
  _,
  response,
  __
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).send({
      status: error.status,
      statusCode: error.statusCode,
      message: error.message,
      error: error?.errors,
      ...(IS_PRODUCTION ? {} : { stack: error.stack }),
    });

    return;
  }

  response.status(500).send({
    status: "fail",
    statusCode: 500,
    message: "Oops, Something went very wrong!",
    ...(IS_PRODUCTION ? {} : { stack: error.stack }),
  });
};

export default errorHandler;
