import mongoose, { HydratedDocumentFromSchema } from "mongoose";
import { ImageRepositoryPort } from "../../domain/ports/image-repository.port";
import { ImageEntity } from "../../domain/entities/image.entity";
import { ImageStatusEnum } from "../../domain/enums/image-status.enum";
import { imageSchema } from "../../common/database/mongo/schemas/image.schema";
import { TUpdateImageMetadataVersionDTO } from "../../dtos/update-image-metadata-version.dto";

class ImagesMongoRepository implements ImageRepositoryPort {

	private model = mongoose.model("Images", imageSchema)

	private mapToEntity(image?: HydratedDocumentFromSchema<typeof imageSchema> | null): ImageEntity | null {
		if (!image) {
			return null
		}
		return new ImageEntity({
			taskId: image.task_id,
			originalFilename: image.original_filename,
			status: image.status as ImageStatusEnum,
			originalMetadata: image.original_metadata || null,
			processedAt: image.processed_at || null,
			errorMessage: image.error_message || "",
			versions: {
				low: image.versions?.low || null,
				medium: image.versions?.medium || null,
				high_optimized: image.versions?.high_optimized || null
			}
		})
	}

	async list(): Promise<ImageEntity[]> {
		const images = await this.model.find().exec()

		if (!images || images?.length === 0) {
			return []
		}

		return images.map(image => this.mapToEntity(image)) as ImageEntity[]
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
		if (!saved) {
			throw new Error("Cannot save image")
		}
		return this.mapToEntity(saved)!
	}

	async getByTaskId(taskId: string): Promise<ImageEntity | null> {
		const image = await this.model.findOne({ task_id: taskId }).exec()
		if (!image) {
			return null
		}
		return this.mapToEntity(image)
	}

	async changeStatus(taskId: string, status: ImageStatusEnum): Promise<ImageEntity | null> {
		const updated = await this.model.findOneAndUpdate({ task_id: taskId }, { $set: { status } }, { new: true }).exec()

		if (!updated) {
			return null
		}

		return this.mapToEntity(updated)

	}

	async updateVersions(dto: TUpdateImageMetadataVersionDTO): Promise<ImageEntity | null> {
		const { task_id, versions } = dto
		const { low, medium, high_optimized } = versions
		const imageFound = await this.getByTaskId(task_id)
		if (!imageFound) {
			return null
		}

		const newVersions: ImageEntity["versions"] = {
			low: low || imageFound.versions.low || null,
			medium: medium || imageFound.versions.medium || null,
			high_optimized: high_optimized || imageFound.versions.high_optimized || null
		}

		const updated = await this.model.findOneAndUpdate({ task_id }, { $set: { versions: newVersions } }, { new: true }).exec()
		if (!updated) {
			return null
		}
		return this.mapToEntity(updated)

	}

	async updateOriginalMetadata(taskId: string, dto: ImageEntity["originalMetadata"]): Promise<ImageEntity | null> {
		const updated = await this.model.findOneAndUpdate({ task_id: taskId }, { $set: { original_metadata: dto } }, { new: true }).exec()
		if (!updated) {
			return null
		}
		return this.mapToEntity(updated)
	}

	async setProcessingError(taskId: string, errorMessage: string): Promise<ImageEntity | null> {
		const updated = await this.model.findOneAndUpdate({ task_id: taskId }, { $set: { error_message: errorMessage, status: ImageStatusEnum.FAILED } }, { new: true }).exec()
		if (!updated) {
			return null
		}
		return this.mapToEntity(updated)
	}

	async setProcessingSuccess(taskId: string): Promise<ImageEntity | null> {
		const updated = await this.model.findOneAndUpdate(
			{ task_id: taskId },
			{
				$set: { status: ImageStatusEnum.COMPLETED, processed_at: new Date() }
			},
			{ new: true }).exec()
		if (!updated) {
			return null
		}
		return this.mapToEntity(updated)
	}
}

export { ImagesMongoRepository }
