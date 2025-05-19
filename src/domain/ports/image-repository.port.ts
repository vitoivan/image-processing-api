import { ImageEntity } from "../entities/image.entity";

export interface ImageRepositoryPort {
	list(): Promise<ImageEntity[]>
}
