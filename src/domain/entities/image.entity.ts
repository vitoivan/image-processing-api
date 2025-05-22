import { ImageStatusEnum } from "../enums/image-status.enum"

type Version = {
	path?: string | null
	width?: number | null
	height?: number | null
	size?: number | null
}

class ImageEntity {
	taskId: string
	originalFilename: string
	status: ImageStatusEnum
	originalMetadata: {
		width?: number | null
		height?: number | null
		mimetype?: string | null
		exif?: Record<string, any> | null
	} | null
	processedAt: Date | null
	errorMessage: string
	versions: {
		low?: Version | null
		medium?: Version | null
		high_optimized?: Version | null
	}

	constructor(data: Partial<ImageEntity> = {}) {
		this.taskId = data.taskId || ""
		this.originalFilename = data.originalFilename || ""
		this.status = data.status || ("") as ImageStatusEnum
		this.originalMetadata = data.originalMetadata ? {
			width: data.originalMetadata.width || null,
			height: data.originalMetadata.height || null,
			mimetype: data.originalMetadata.mimetype || null,
			exif: data.originalMetadata.exif || null
		} : null
		this.processedAt = data.processedAt || null
		this.errorMessage = data.errorMessage || ""
		this.versions = {
			low: data.versions?.low || null,
			medium: data.versions?.medium || null,
			high_optimized: data.versions?.high_optimized || null
		}
	}

	getOriginalFilePath(): string {
		const splitted = this.originalMetadata?.mimetype?.split("/") || this.originalFilename.split(".")
		return `${this.taskId}.${splitted[splitted.length - 1]}`
	}
}


export { ImageEntity }
