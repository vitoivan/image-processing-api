import { NodeEnv } from "../enums/nodeEnv";
import { envs } from "../env";
import { BunnyStorageAdapter } from "./adapters/file-storage.bunny";
import { DiskStorageAdapter } from "./adapters/file-storage.disk";
import { InMemoryStorageAdapter } from "./adapters/file-storage.in-memory";
import { FileStoragePort } from "./ports/file-storage.port";

function getStorageRepository(): FileStoragePort {

	if (envs.NODE_ENV === NodeEnv.TEST) {
		return new InMemoryStorageAdapter()
	}

	if (envs.STORAGE_TYPE === "local") {
		return new DiskStorageAdapter()
	}

	if (envs.STORAGE_TYPE === "bunny") {
		return new BunnyStorageAdapter()
	}

	throw new Error(`Unknown storage type ${envs.STORAGE_TYPE}`)
}

const storageRepository = getStorageRepository()

export { storageRepository }
