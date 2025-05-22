import { Readable } from "stream";
import { FileStoragePort } from "../ports/file-storage.port";
import { pipelineAsync } from "../../utils";
import { createReadStream, createWriteStream } from "fs";
import { join } from "path";
import { Logger } from "../../utils/logger";

class DiskStorageAdapter implements FileStoragePort {
	private static storageDirectoryPath = join(__dirname, "..", "..", "..", "..", "storage")

	private logger = new Logger(DiskStorageAdapter.name)


	constructor() {
		this.logger.log(`Using disk storage adapter ${DiskStorageAdapter.storageDirectoryPath}`)
	}

	async sendFile(fileStream: Readable, filename: string): Promise<void> {
		await pipelineAsync(
			fileStream,
			createWriteStream(`${DiskStorageAdapter.storageDirectoryPath}/${filename}`)
		)
	}

	downloadFile(filename: string): Readable {
		return createReadStream(`${DiskStorageAdapter.storageDirectoryPath}/${filename}`)
	}
}


export { DiskStorageAdapter }
