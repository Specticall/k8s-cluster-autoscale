import { RequestHandler } from "express";
import z from "zod";
import { validateSchema } from "../utils/http/validate-schema";
import { AppError } from "../utils/http/app-error";
import { STATUS } from "../utils/http/status-codes";
import scaleWorker from "../core/scale-worker";
import { messageQueue } from "..";

export const scale: RequestHandler = async (request, response, next) => {
  try {
    // INFO : Prometheus logging
    if (!request.body) {
      throw new AppError("Request body not found", STATUS.NOT_FOUND);
    }
    messageQueue.queueMessage(JSON.stringify(request.body));

    response.send({
      message: "Successfuly started scale process",
    });
  } catch (error) {
    next(error);
  }
};
