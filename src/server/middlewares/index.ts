import { Express } from "express";
import { loggerMiddleware } from "./logger";

export function registerMiddlewares(app: Express) {
	console.log("Registering middlewares ...")
	app.use(loggerMiddleware)
}
