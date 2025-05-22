import { Request, Response } from "express";
import { GetImageFromStorageDTO } from "../../dtos/get-image-from-storage.dto";
import { downloadFileService } from "../../domain/services/download-file.service";
import { storageRepository } from "../../common/file-storage/repository";
import { buildHttpError, pipelineAsync } from "../../common/utils";
import { getImageMetadataByTaskIdService } from "../../domain/services/get-image-metadata-by-task-id.service";
import { imagesRepository } from "../../repositories/images/repository";


async function getImageFromStorageHandler(req: Request, res: Response) {
	try {
		const dto = GetImageFromStorageDTO.parse(req.params)

		const imageMetadata = await getImageMetadataByTaskIdService({ imagesRepository: imagesRepository, taskId: dto.file_id })

		const fileStream = await downloadFileService({
			storageRepository: storageRepository,
			id: imageMetadata.getOriginalStoragePath()
		})

		await pipelineAsync(fileStream, res)

	} catch (err) {
		const httpErr = buildHttpError(err)
		res.status(httpErr.statusCode).json(httpErr)
	}
}

export { getImageFromStorageHandler }
