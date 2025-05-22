import mongoose, { HydratedDocumentFromSchema } from "mongoose";
import { ImageRepositoryPort } from "../../domain/ports/image-repository.port";
import { ImageEntity } from "../../domain/entities/image.entity";
import { ImageStatusEnum } from "../../domain/enums/image-status.enum";
import { imageSchema } from "../../common/database/mongo/schemas/image.schema";

class ImagesMongoRepository implements ImageRepositoryPort {

	private model = mongoose.model("Images", imageSchema)

	private mapToEntity(image: HydratedDocumentFromSchema<typeof imageSchema>): ImageEntity {
		return new ImageEntity({
			taskId: image.task_id,
			originalFilename: image.original_filename,
			status: image.status as ImageStatusEnum,
			originalMetadata: image.original_metadata || null,
			processedAt: image.processed_at || null,
			errorMessage: image.error_message || "",
			versions: image.versions || {
				low: null,
				medium: null,
				high_optimized: null
			}
		})
	}

	async list(): Promise<ImageEntity[]> {
		const images = await this.model.find().exec()

		if (!images || images?.length === 0) {
			return []
		}

		return images.map(image => this.mapToEntity(image))
	}

	async insert(image: ImageEntity): Promise<ImageEntity> {
		const newImage = new this.model({
			task_id: image.taskId,
			original_filename: image.originalFilename,
			status: image.status,
			original_metadata: image.originalMetadata ? {
				width: image.originalMetadata.width,
				height: image.originalMetadata.height,
				mimetype: image.originalMetadata.mimetype,
				exif: image.originalMetadata.exif
			} : null,
			processed_at: image.processedAt || null,
			error_message: image.errorMessage || "",
			versions: {
				low: image.versions?.low || null,
				medium: image.versions?.medium || null,
				high_optimized: image.versions?.high_optimized || null
			}
		})
		const saved = await newImage.save()
		return this.mapToEntity(saved)
	}

	async getByTaskId(taskId: string): Promise<ImageEntity | null> {
		const image = await this.model.findOne({ task_id: taskId }).exec()
		if (!image) {
			return null
		}
		return this.mapToEntity(image)
	}
}

export { ImagesMongoRepository }
