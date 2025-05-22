import { Express } from "express";
import { uploadImageHandler } from "../handlers/upload-image.handler";
import { getImageFromStorageHandler } from "../handlers/get-image-from-storage.handler";
import { getImageMetadataByTaskIdHandler } from "../handlers/get-image-metadata-by-taskId.handler";
import { listImagesMetadataHandler } from "../handlers/list-images-metadata.handler";
import { reprocessTaskByTaskIdHandler } from "../handlers/reprocess-task.handler";
import { defaultLogger } from "../../common/utils/logger";

function registerRoutes(app: Express) {
	defaultLogger.log("Registering routes ...")
	app.get("/images", listImagesMetadataHandler)
	app.post("/images", uploadImageHandler)
	app.get("/images/:file_id", getImageFromStorageHandler)
	app.post("/reprocess/:task_id", reprocessTaskByTaskIdHandler)
	app.get("/status/:task_id", getImageMetadataByTaskIdHandler)
}

export { registerRoutes }
