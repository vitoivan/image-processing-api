import Busboy, { FileInfo } from "busboy";
import { Request, Response } from "express";
import { buildHttpError, pipelineAsync } from "../../common/utils";
import { storageRepository } from "../../common/file-storage/repository";
import { imagesRepository } from "../../repositories/images/repository";
import { uploadFileService } from "../../domain/services/upload-file.service";
import { v4 } from "uuid";
import { insertImagesMetadataService } from "../../domain/services/insert-image-metadata.service";
import { Readable } from "stream";
import { messageBroker } from "../../common/message-broker";
import { sendFileUploadedEventService } from "../../domain/services/send-file-uploaded-event.service";


async function uploadImageHandler(req: Request, res: Response) {
	const busboy = Busboy({ headers: req.headers });

	let fileId = v4()
	let responseSent = false;
	let fileInfo: FileInfo
	let fileUploadPromise: Promise<void>

	function safeSend(fn: () => void) {
		if (!responseSent) {
			fn();
			responseSent = true;
		}
	}

	function sendError(err: any) {
		const error = buildHttpError(err)
		safeSend(() => res.status(error.statusCode).json(error))
	}

	function onFileUpload(_: string, file: Readable, info: FileInfo) {
		fileInfo = info
		const splitted = info.mimeType.split("/")
		const ext = splitted[splitted.length - 1]

		fileUploadPromise = uploadFileService({
			id: `${fileId}.${ext}`,
			fileStream: file,
			storageRepository: storageRepository
		}).catch((err) => {
			busboy.destroy(err as Error)
		})
	}

	async function onFinish() {
		try {
			await fileUploadPromise
			if (!fileInfo) throw new Error("File info not found")
			const inserted = await insertImagesMetadataService({
				imagesRepository,
				data: {
					task_id: fileId,
					original_filename: fileInfo.filename,
					original_metadata: {
						mimetype: fileInfo.mimeType,
					},
				}
			})
			await sendFileUploadedEventService({
				file: inserted,
				messageBroker: messageBroker,
			})
			safeSend(() => res.status(202).json({ fileId }))
		} catch (err) {
			sendError(err)
		}
	}

	function onError(err: Error) {
		sendError(err)
	}

	busboy.on("file", onFileUpload);
	busboy.on("finish", onFinish);
	busboy.on("error", onError);

	await pipelineAsync(req, busboy)
}


export { uploadImageHandler }
