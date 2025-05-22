import "dotenv/config"
import { MongoDBAdapter } from "../common/database/mongo"
import { envs } from "../common/env"
import { RabbitMQAdapter } from "../common/message-broker/adapters/rabbitmq"
import { TBrokerMessageDTO } from "../common/message-broker/dtos/broker-message.dto"
import { getImageMetadataByTaskIdService } from "../domain/services/get-image-metadata-by-task-id.service"
import { imagesRepository } from "../repositories/images/repository"
import { downloadFileService } from "../domain/services/download-file.service"
import { storageRepository } from "../common/file-storage/repository"
import { pipelineAsync } from "../common/utils"
import sharp from "sharp"

enum OptimizationLevel {
	Low = "low",
	Medium = "medium",
	High = "high"
}

enum ImageFormat {
	JPEG = "jpeg",
	JPG = "jpg",
	PNG = "png",
	WEBP = "webp"
}

const resizeMap = {
	low: 320,
	medium: 800,
	high: null, // mantém dimensões originais
};

const qualityMap = {
	low: 40,
	medium: 70,
	high: 85,
};

type GenerateOptimizedImageParams = {
	buffer: Buffer<ArrayBuffer>,
	level: OptimizationLevel,
	format: ImageFormat,
}

async function generateOptimizedImage({ buffer, level, format }: GenerateOptimizedImageParams) {

	const image = sharp(buffer)
	const width = resizeMap[level]

	const resizedImage = width ? image.resize({ width }) : image

	const quality = qualityMap[level]
	console.log("Generating optimized image ...", level, format, quality, width)

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


async function processImage({ properties, content }: TBrokerMessageDTO): Promise<void> {

	console.log("Received message: ", content, properties)
	const { id } = content as { id: string }

	if (!id) {
		throw new Error("Id not found on message content")
	}

	const image = await getImageMetadataByTaskIdService({ imagesRepository: imagesRepository, taskId: id })

	const fileStream = await downloadFileService({
		storageRepository: storageRepository,
		id: image.getOriginalFilePath()
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
		width: originalMetadata.width,
		height: originalMetadata.height,
		exif: originalMetadata.exif || null,
	}

	const format = originalMetadata.format as any

	const low = await generateOptimizedImage({ buffer, level: OptimizationLevel.Low, format })
	const medium = await generateOptimizedImage({ buffer, level: OptimizationLevel.Medium, format })
	const high = await generateOptimizedImage({ buffer, level: OptimizationLevel.High, format })

	const metadatas = await Promise.all([
		sharp(low).metadata(),
		sharp(medium).metadata(),
		sharp(high).metadata(),
	]);


	console.log({ metadatas })

}

async function runWorker() {
	await MongoDBAdapter.init(envs.MONGO_URI)
	await RabbitMQAdapter.init({
		uri: envs.RABBITMQ_URI,
		queue: envs.RABBITMQ_QUEUE,
		exchange: envs.RABBITMQ_EXCHANGE
	})

	// messageBroker.listenToQueue(envs.RABBITMQ_QUEUE, handler)
	await processImage({ properties: { headers: {} }, content: { id: "27161098-4ee2-4875-a49c-612b1e324a8e" } })
}

if (require.main) {
	runWorker().then(() => {
		console.log("worker process image running")
	}).catch((err) => {
		console.error(err)
	})
}

export { processImage }


