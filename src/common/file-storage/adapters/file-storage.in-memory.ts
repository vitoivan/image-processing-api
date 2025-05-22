import { Readable } from "stream";
import { FileStoragePort } from "../ports/file-storage.port";
import { HttpError } from "../../http-error";

class InMemoryStorageAdapter implements FileStoragePort {

	files: Record<string, Buffer> = {};

	reset() {
		this.files = {};
	}

	sendFile(fileStream: Readable, filename: string): Promise<void> {
		const chunks: Buffer[] = [];
		return new Promise((resolve, reject) => {
			fileStream.on("data", (chunk) => chunks.push(chunk));
			fileStream.on("end", () => {
				this.files[filename] = Buffer.concat(chunks);
				resolve();
			});
			fileStream.on("error", reject);
		});
	}

	downloadFile(filename: string): Readable {
		const file = this.files[filename];

		if (!file) {
			throw new HttpError(`File not found`, 404);
		}

		return Readable.from(file);
	}
}


export { InMemoryStorageAdapter }
