import { ImageRepositoryPort } from "../../domain/ports/image-repository.port";
import { ImageEntity } from "../../domain/entities/image.entity";

class ImagesMemoryRepository implements ImageRepositoryPort {

	private images: ImageEntity[] = [];

	reset() {
		this.images = [];
	}


	async list(): Promise<ImageEntity[]> {
		return this.images
	}

	async insert(image: ImageEntity): Promise<ImageEntity> {
		this.images.push(image)
		return image
	}

	async getByTaskId(taskId: string): Promise<ImageEntity | null> {
		const image = this.images.find(image => image.taskId === taskId)
		if (!image) {
			return null
		}
		return image
	}
}

export { ImagesMemoryRepository }
