import { Request, Response } from "express";
import { listImagesService } from "../../domain/services/list-images.service";
import { imagesRepository } from "../../repositories/images/repository";

async function listImagesHandler(_: Request, res: Response) {
	res.status(201).json(await listImagesService({ imagesRepository }))
}

export { listImagesHandler }
