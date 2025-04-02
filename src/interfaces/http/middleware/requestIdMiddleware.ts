import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Config } from "../../../infrastructure/config";

export function requestIdMiddleware(config: Config) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const reqIdHeaderName = config.getOrThrow("REQUEST_ID_HEADER_NAME");

    const oldValue = req.get(reqIdHeaderName);
    const id = oldValue ?? uuidv4();

    res.set(reqIdHeaderName, id);

    (req as any).requestId = id;

    next();
  };
}
