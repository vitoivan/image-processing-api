import { PassThrough, Readable } from "stream";
import { envs } from "../../env";
import { request, RequestOptions } from "https";
import { HttpError } from "../../http-error";
import { Logger } from "../../utils/logger";

class BunnyStorageAdapter {
	private static host = envs.BUNNY_STORAGE_HOSTNAME;
	private static storageName = envs.BUNNY_STORAGE_NAME;
	private static apiKey = envs.BUNNY_STORAGE_API_KEY;

	private logger = new Logger("BunnyStorageAdapter")


	sendFile(fileStream: Readable, filename: string): Promise<void> {
		return new Promise((resolve, reject) => {

			const options: RequestOptions = {
				method: 'PUT',
				host: BunnyStorageAdapter.host,
				path: `/${BunnyStorageAdapter.storageName}/${filename}`,
				headers: {
					'Content-Type': 'application/octet-stream',
					AccessKey: BunnyStorageAdapter.apiKey,
				},
			}

			const req = request(options, (res) => {
				res.on('data', (chunk) => {
					this.logger.log(chunk.toString('utf8'));
				});
			});


			req.on('error', (error) => {
				reject(error)
			});

			fileStream.pipe(req);

			fileStream.on('end', () => {
				resolve()
			})

		})

	}

	downloadFile(filename: string): Readable {

		const passThrough = new PassThrough();

		const options = {
			method: 'GET',
			hostname: BunnyStorageAdapter.host,
			path: `/${BunnyStorageAdapter.storageName}/${filename}`,
			headers: {
				'Content-Type': 'application/octet-stream',
				AccessKey: BunnyStorageAdapter.apiKey,
			},
		};

		const req = request(options, (res) => {
			if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
				res.pipe(passThrough);
			} else {
				let error: Error = new Error(`Error downloading file: ${res.statusCode}`);
				if (res.statusCode === 404) {
					error = new HttpError('File not found', 404);
				}

				queueMicrotask(() => {
					passThrough.emit('error', error);
				});
			}
		});

		req.on('error', (err) => {
			queueMicrotask(() => {
				passThrough.emit('error', err);
			});
		});

		req.end();

		return passThrough
	}
}


export { BunnyStorageAdapter }
