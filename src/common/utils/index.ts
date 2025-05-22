import { pipeline } from "stream";
import { promisify } from "util";
import { buildHttpError } from "./build-http-error";

const pipelineAsync = promisify(pipeline);

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

export {
	pipelineAsync,
	promisify,
	buildHttpError,
	sleep
}

