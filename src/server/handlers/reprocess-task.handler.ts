import { Request, Response } from "express";
import { buildHttpError } from "../../common/utils";
import { getImageMetadataByTaskIdService } from "../../domain/services/get-image-metadata-by-task-id.service";
import { imagesRepository } from "../../repositories/images/repository";
import { sendFileUploadedEventService } from "../../domain/services/send-file-uploaded-event.service";
import { messageBroker } from "../../common/message-broker";


async function reprocessTaskByTaskIdHandler(req: Request, res: Response) {
	try {
		const image = await getImageMetadataByTaskIdService({ imagesRepository: imagesRepository, taskId: req.params.task_id })
		await sendFileUploadedEventService({
			messageBroker: messageBroker,
			file: image
		})

		res.status(200).json({ message: "ok" })

	} catch (err) {
		const httpErr = buildHttpError(err)
		res.status(httpErr.statusCode).json(httpErr)
	}
}

export { reprocessTaskByTaskIdHandler }
