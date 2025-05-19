import { ImageEntity } from "../entities/image.entity"
import { ImageRepositoryPort } from "../ports/image-repository.port"

export type ListImagesServiceParams = {
	imagesRepository: ImageRepositoryPort
}

export async function listImagesService({ imagesRepository }: ListImagesServiceParams): Promise<ImageEntity[]> {
	const images = await imagesRepository.list()
	return images
}
