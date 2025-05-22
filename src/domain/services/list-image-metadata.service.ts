import { ImageEntity } from "../entities/image.entity"
import { ImageRepositoryPort } from "../ports/image-repository.port"

type ListImagesMetadataServiceParams = {
	imagesRepository: ImageRepositoryPort
}

async function listImagesMetadataService({ imagesRepository }: ListImagesMetadataServiceParams): Promise<ImageEntity[]> {
	const images = await imagesRepository.list()
	return images
}

export { listImagesMetadataService, ListImagesMetadataServiceParams }
