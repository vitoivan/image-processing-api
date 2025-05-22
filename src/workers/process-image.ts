import "dotenv/config"
import { MongoDBAdapter } from "../common/database/mongo"
import { envs } from "../common/env"
import { RabbitMQAdapter } from "../common/message-broker/adapters/rabbitmq"
import { TBrokerMessageDTO } from "../common/message-broker/dtos/broker-message.dto"
import { getImageMetadataByTaskIdService } from "../domain/services/get-image-metadata-by-task-id.service"
import { imagesRepository } from "../repositories/images/repository"
import { downloadFileService } from "../domain/services/download-file.service"
import { storageRepository } from "../common/file-storage/repository"
import { pipelineAsync, sleep } from "../common/utils"
import sharp from "sharp"
import { ImageStatusEnum } from "../domain/enums/image-status.enum"
import { messageBroker } from "../common/message-broker"
import { Readable } from "stream"

enum OptimizationLevel {
	Low = "low",
	Medium = "medium",
	High = "high_optimized"
}

enum ImageFormat {
	JPEG = "jpeg",
	JPG = "jpg",
	PNG = "png",
	WEBP = "webp"
}

const resizeMap = {
	[OptimizationLevel.High]: 320,
	[OptimizationLevel.Medium]: 800,
	[OptimizationLevel.Low]: null,
};

const qualityMap = {
	[OptimizationLevel.Low]: 90,
	[OptimizationLevel.Medium]: 65,
	[OptimizationLevel.High]: 40,
};

type GenerateOptimizedImageParams = {
	buffer: Buffer<ArrayBuffer>,
	level: OptimizationLevel,
	format: ImageFormat,
}

async function generateOptimizedImage({ buffer, level, format }: GenerateOptimizedImageParams) {

	console.log("Generating optimized image ...")
	const image = sharp(buffer)
	let width = resizeMap[level]

	const resizedImage = width ? image.resize({ width }) : image

	const quality = qualityMap[level]

	switch (format) {
		case ImageFormat.JPEG:
		case ImageFormat.JPG:
			return await resizedImage.jpeg({ quality }).toBuffer()
		case ImageFormat.PNG:
			return await resizedImage.png({
				quality: level === OptimizationLevel.Low ? 9 : level === OptimizationLevel.Medium ? 7 : 5
			}).toBuffer()
		case ImageFormat.WEBP:
			return await resizedImage.webp({ quality }).toBuffer()
		default:
			// fallback para JPEG
			return await resizedImage.jpeg({ quality }).toBuffer();
	}
}

async function uploadImageToStorage(buffer: Buffer<ArrayBuffer>, id: string) {
	const stream = Readable.from(buffer)
	await storageRepository.sendFile(stream, id)
}


async function processImage({ content }: TBrokerMessageDTO): Promise<void> {

	console.log("Received message: ", content)
	const { data: { id } } = content as { data: { id: string } }

	if (!id) {
		throw new Error("Id not found on message content")
	}

	const image = await getImageMetadataByTaskIdService({ imagesRepository: imagesRepository, taskId: id })

	if (!await imagesRepository.changeStatus(image.taskId, ImageStatusEnum.PROCESSING)) {
		throw new Error("Cannot set image status to processing")
	}

	try {
		await sleep(1500) // wait 1.5 seconds before download file because it can take some time to be available in the bunny storage
		const fileStream = await downloadFileService({
			storageRepository: storageRepository,
			id: image.getOriginalStoragePath()
		})

		const bufferArray = Array<Buffer>()

		const handleBytes = async (data: AsyncIterable<Buffer>) => {
			for await (const chunk of data) {
				bufferArray.push(chunk)
			}
		}

		await pipelineAsync(fileStream, handleBytes)

		const buffer = Buffer.concat(bufferArray)
		const transform = sharp(buffer)

		const originalMetadata = await transform.metadata()

		image.originalMetadata = {
			...image.originalMetadata,
			width: originalMetadata.width,
			height: originalMetadata.height,
			exif: originalMetadata.exif || null,
		}

		if (!await imagesRepository.updateOriginalMetadata(image.taskId, image.originalMetadata)) {
			throw new Error("Cannot update image original metadata")
		}

		const format = originalMetadata.format as any

		const [low, medium, high] = await Promise.all([
			generateOptimizedImage({ buffer, level: OptimizationLevel.Low, format }),
			generateOptimizedImage({ buffer, level: OptimizationLevel.Medium, format }),
			generateOptimizedImage({ buffer, level: OptimizationLevel.High, format }),
		])

		const [lowMeta, mediumMeta, highMeta] = await Promise.all([
			sharp(low).metadata(),
			sharp(medium).metadata(),
			sharp(high).metadata(),
		]);

		await Promise.all([
			uploadImageToStorage(low, image.getOptimizedStoragePath(OptimizationLevel.Low)),
			uploadImageToStorage(medium, image.getOptimizedStoragePath(OptimizationLevel.Medium)),
			uploadImageToStorage(high, image.getOptimizedStoragePath(OptimizationLevel.High)),
		])

		const updatedVersions = await imagesRepository.updateVersions({
			task_id: image.taskId, versions: {
				low: {
					path: image.getOptimizedStoragePath(OptimizationLevel.Low),
					width: lowMeta.width,
					height: lowMeta.height,
					size: lowMeta.size || 0,
				},
				medium: {
					path: image.getOptimizedStoragePath(OptimizationLevel.Medium),
					width: mediumMeta.width,
					height: mediumMeta.height,
					size: mediumMeta.size || 0,
				},
				high_optimized: {
					path: image.getOptimizedStoragePath(OptimizationLevel.High),
					width: highMeta.width,
					height: highMeta.height,
					size: highMeta.size || 0,
				},

			}
		})
		if (!updatedVersions) {
			throw new Error("Cannot update image metadata versions")
		}
		if (!await imagesRepository.setProcessingSuccess(image.taskId)) {
			throw new Error("Cannot set image status to processed")
		}
		console.log("Image processed successfully")
	} catch (err) {
		await imagesRepository.setProcessingError(image.taskId, (err as Error).message)
		throw err
	}
}

async function runWorker() {
	await MongoDBAdapter.init(envs.MONGO_URI)
	await RabbitMQAdapter.init({
		uri: envs.RABBITMQ_URI,
		queue: envs.RABBITMQ_QUEUE,
		exchange: envs.RABBITMQ_EXCHANGE
	})

	messageBroker.listenToQueue(envs.RABBITMQ_QUEUE, processImage)
	// await processImage({ properties: { headers: {} }, content: { id: "27161098-4ee2-4875-a49c-612b1e324a8e" } })
}

if (require.main) {
	runWorker().then(() => {
		console.log("worker process image running")
	}).catch((err) => {
		console.error(err)
	})
}

export { processImage }


