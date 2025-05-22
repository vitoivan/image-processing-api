import { HttpError } from "../../common/http-error"
import { ImageEntity } from "../entities/image.entity"
import { ImageRepositoryPort } from "../ports/image-repository.port"

type GetImageByTaskIdServiceParams = {
	imagesRepository: ImageRepositoryPort
	taskId: string
}

async function getImageMetadataByTaskIdService({ imagesRepository, taskId }: GetImageByTaskIdServiceParams): Promise<ImageEntity> {
	const image = await imagesRepository.getByTaskId(taskId)
	if (!image) {
		throw new HttpError("Image not found", 404)
	}
	return image
}

export { getImageMetadataByTaskIdService, GetImageByTaskIdServiceParams }
