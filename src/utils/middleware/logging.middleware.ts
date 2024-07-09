import { Request, Response, NextFunction } from 'express';
import logger from "../../shared/log/logger";

const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.url}`);
    next();
};

export default loggingMiddleware;
