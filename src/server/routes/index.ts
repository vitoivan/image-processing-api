import { Express } from "express";
import { listImagesHandler } from "../handlers/list-images.handler";

function registerRoutes(app: Express) {
	console.log("Registering routes ...")
	app.get("/images", listImagesHandler)
}

export { registerRoutes }
