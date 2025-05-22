import { z } from "zod"
import { ImageEntity } from "../entities/image.entity"
import { ImageRepositoryPort } from "../ports/image-repository.port"
import { InsertImageMetadataDTO } from "../../dtos/insert-image-metadata.dto"
import { ImageStatusEnum } from "../enums/image-status.enum"

type InsertImageMetadataServiceParams = {
	imagesRepository: ImageRepositoryPort
	data: z.infer<typeof InsertImageMetadataDTO>
}

async function insertImagesMetadataService({ imagesRepository, data }: InsertImageMetadataServiceParams): Promise<ImageEntity> {

	const toInsert = new ImageEntity({
		taskId: data.task_id,
		originalFilename: data.original_filename,
		status: ImageStatusEnum.PENDING,
		originalMetadata: data.original_metadata,
		processedAt: data.processed_at
	})


	const image = await imagesRepository.insert(toInsert)
	return image
}

export { insertImagesMetadataService, InsertImageMetadataServiceParams }
