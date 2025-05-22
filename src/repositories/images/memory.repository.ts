import { ImageRepositoryPort } from "../../domain/ports/image-repository.port";
import { ImageEntity } from "../../domain/entities/image.entity";
import { ImageStatusEnum } from "../../domain/enums/image-status.enum";

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

	async changeStatus(taskId: string, status: ImageStatusEnum): Promise<ImageEntity | null> {
		const image = await this.getByTaskId(taskId)
		if (!image) {
			return null
		}
		image.status = status
		return image
	}

	async updateVersions(dto: any): Promise<ImageEntity | null> {
		const image = await this.getByTaskId(dto.taskId)
		if (!image) {
			return null
		}
		image.versions = dto.versions
		return image
	}

	async updateOriginalMetadata(taskId: string, dto: any): Promise<ImageEntity | null> {
		const image = await this.getByTaskId(taskId)
		if (!image) {
			return null
		}
		image.originalMetadata = dto
		return image
	}

	async setProcessingSuccess(taskId: string): Promise<ImageEntity | null> {
		const image = await this.getByTaskId(taskId)
		if (!image) {
			return null
		}
		image.status = ImageStatusEnum.COMPLETED
		image.processedAt = new Date()
		return image
	}

	async setProcessingError(taskId: string, errorMessage: string): Promise<ImageEntity | null> {
		const image = await this.getByTaskId(taskId)
		if (!image) {
			return null
		}
		image.status = ImageStatusEnum.FAILED
		image.errorMessage = errorMessage
		return image
	}
}

export { ImagesMemoryRepository }
