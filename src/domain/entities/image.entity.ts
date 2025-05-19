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
		width: number
		height: number
		mimetype: string
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
		this.originalMetadata = data.originalMetadata || null
		this.processedAt = data.processedAt || null
		this.errorMessage = data.errorMessage || ""
		this.versions = data.versions || {}
	}
}


export { ImageEntity }
