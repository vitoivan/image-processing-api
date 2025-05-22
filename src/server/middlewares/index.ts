import { Express, urlencoded } from "express";
import { loggerMiddleware } from "./logger";
import { defaultLogger } from "../../common/utils/logger";

export function registerMiddlewares(app: Express) {
	defaultLogger.log("Registering middlewares ...")
	app.use(loggerMiddleware)
	app.use(urlencoded({ extended: true }));
}
