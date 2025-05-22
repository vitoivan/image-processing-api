import { Request, Response } from "express";
import { listImagesMetadataService } from "../../domain/services/list-image-metadata.service";
import { imagesRepository } from "../../repositories/images/repository";

async function listImagesMetadataHandler(_: Request, res: Response) {
	res.status(200).json(await listImagesMetadataService({ imagesRepository: imagesRepository }))
}

export { listImagesMetadataHandler }
