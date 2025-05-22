import { ImageEntity } from "../entities/image.entity";

export interface ImageRepositoryPort {
	list(): Promise<ImageEntity[]>
	getByTaskId(taskId: string): Promise<ImageEntity | null>
	insert(image: ImageEntity): Promise<ImageEntity>
}
