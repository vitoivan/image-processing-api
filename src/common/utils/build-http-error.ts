import { STATUS_CODES } from "http"
import { HttpError } from "../http-error"

function buildHttpError(err: any, status = 500) {
	let msg = "Internal server error"

	if (err instanceof HttpError) {
		return err.toJSON()
	} else if (err instanceof Error) {
		msg = err.message
	}

	const body = {
		error: STATUS_CODES[status],
		statusCode: status,
		message: msg,
	}

	return body
}

export { buildHttpError }
