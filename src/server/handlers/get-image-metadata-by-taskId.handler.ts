import { Request, Response } from "express";
import { GetImageMetadataByTaskIdDTO } from "../../dtos/get-image-metadata-by-task-id.dto";
import { imagesRepository } from "../../repositories/images/repository";
import { getImageMetadataByTaskIdService } from "../../domain/services/get-image-metadata-by-task-id.service";
import { buildHttpError } from "../../common/utils";


async function getImageMetadataByTaskIdHandler(req: Request, res: Response) {
	const dto = GetImageMetadataByTaskIdDTO.parse(req.params)
	try {
		const imageMetadata = await getImageMetadataByTaskIdService({ imagesRepository: imagesRepository, taskId: dto.task_id })
		res.json(imageMetadata)
	} catch (err) {
		const httpErr = buildHttpError(err)
		res.status(httpErr.statusCode).json(httpErr)
	}

}

export { getImageMetadataByTaskIdHandler }
