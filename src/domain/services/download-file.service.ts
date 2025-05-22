import Stream from "stream"
import { FileStoragePort } from "../../common/file-storage/ports/file-storage.port"

type DownloadFileServiceParams = {
	id: string,
	storageRepository: FileStoragePort
}


async function downloadFileService({ storageRepository, id }: DownloadFileServiceParams) {
	const file = storageRepository.downloadFile(id)
	return file
}


export { downloadFileService }
