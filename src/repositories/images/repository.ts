import { NodeEnv } from "../../common/enums/nodeEnv"
import { envs } from "../../common/env"
import { ImageRepositoryPort } from "../../domain/ports/image-repository.port"
import { ImagesMemoryRepository } from "./memory.repository"
import { ImagesMongoRepository } from "./mongo.repository"

function getRepository(): ImageRepositoryPort {

	if (envs.NODE_ENV === NodeEnv.TEST) {
		return new ImagesMemoryRepository()
	}

	return new ImagesMongoRepository()
}

const imagesRepository: ImageRepositoryPort = getRepository()

export { imagesRepository }
