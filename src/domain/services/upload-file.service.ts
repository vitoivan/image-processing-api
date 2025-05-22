import Stream from "stream"
import { FileStoragePort } from "../../common/file-storage/ports/file-storage.port"

type UploadFileServiceParams = {
	id: string,
	fileStream: Stream.Readable,
	storageRepository: FileStoragePort
}


async function uploadFileService({ fileStream, storageRepository, id }: UploadFileServiceParams) {
	await storageRepository.sendFile(fileStream, id)
}


export { uploadFileService }
