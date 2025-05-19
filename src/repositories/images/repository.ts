import { ImageRepositoryPort } from "../../domain/ports/image-repository.port"
import { ImagesMongoRepository } from "./mongo.repository"

const imagesRepository: ImageRepositoryPort = new ImagesMongoRepository()

export { imagesRepository }
