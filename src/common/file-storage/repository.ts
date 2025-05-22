import { NodeEnv } from "../enums/nodeEnv";
import { envs } from "../env";
import { BunnyStorageAdapter } from "./adapters/file-storage.bunny";
import { InMemoryStorageAdapter } from "./adapters/file-storage.in-memory";
import { FileStoragePort } from "./ports/file-storage.port";

function getStorageRepository(): FileStoragePort {

	if (envs.NODE_ENV === NodeEnv.TEST) {
		return new InMemoryStorageAdapter()
	}

	return new BunnyStorageAdapter()
}

const storageRepository = getStorageRepository()

export { storageRepository }
