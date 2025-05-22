import { STATUS_CODES } from "http"

export class HttpError implements Error {
	message: string
	name: string
	statusCode: number

	constructor(message: string, statusCode: number) {
		this.name = STATUS_CODES[statusCode] || ""
		this.message = message
		this.statusCode = statusCode
	}

	toJSON() {
		return {
			error: this.name,
			statusCode: this.statusCode,
			message: this.message,
		}
	}
}
