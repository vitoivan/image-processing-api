import { TUpdateImageMetadataVersionDTO } from "../../dtos/update-image-metadata-version.dto";
import { ImageEntity } from "../entities/image.entity";
import { ImageStatusEnum } from "../enums/image-status.enum";

export interface ImageRepositoryPort {
	list(): Promise<ImageEntity[]>
	getByTaskId(taskId: string): Promise<ImageEntity | null>
	insert(image: ImageEntity): Promise<ImageEntity>
	changeStatus(taskId: string, status: ImageStatusEnum, errorMessage?: string): Promise<ImageEntity | null>
	updateVersions(dto: TUpdateImageMetadataVersionDTO): Promise<ImageEntity | null>
	updateOriginalMetadata(taskId: string, dto: ImageEntity["originalMetadata"]): Promise<ImageEntity | null>
	setProcessingError(taskId: string, errorMessage: string): Promise<ImageEntity | null>
	setProcessingSuccess(taskId: string): Promise<ImageEntity | null>
}
