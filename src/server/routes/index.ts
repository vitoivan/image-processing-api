import { Express } from "express";
import { uploadImageHandler } from "../handlers/upload-image.handler";
import { getImageFromStorageHandler } from "../handlers/get-image-from-storage.handler";
import { getImageMetadataByTaskIdHandler } from "../handlers/get-image-metadata-by-taskId.handler";
import { listImagesMetadataHandler } from "../handlers/list-images-metadata.handler";

function registerRoutes(app: Express) {
	console.log("Registering routes ...")
	app.get("/images", listImagesMetadataHandler)
	app.post("/images", uploadImageHandler)
	app.get("/images/:file_id", getImageFromStorageHandler)
	app.get("/status/:task_id", getImageMetadataByTaskIdHandler)
}

export { registerRoutes }
