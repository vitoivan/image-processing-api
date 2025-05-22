import { pipeline } from "stream";
import { promisify } from "util";
import { buildHttpError } from "./build-http-error";

const pipelineAsync = promisify(pipeline);

export {
	pipelineAsync,
	promisify,
	buildHttpError
}

