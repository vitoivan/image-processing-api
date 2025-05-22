import mongoose from "mongoose";
import { envs } from "../../env";
import { NodeEnv } from "../../enums/nodeEnv";

const defaultOpts: mongoose.ConnectOptions = {
	dbName: "database",
	minPoolSize: 5,
	maxPoolSize: 20,
	bufferCommands: false,
	connectTimeoutMS: 1000 * 5, // 5 seconds
	socketTimeoutMS: 1000 * 5, // 5 seconds
	timeoutMS: 1000 * 10, // 10 seconds
	serverSelectionTimeoutMS: 1000 * 5, // 5 seconds
}

class MongoDBAdapter {

	static isTest() {
		return envs.NODE_ENV === NodeEnv.TEST
	}

	static async init(mongoURI: string, opts: mongoose.ConnectOptions = defaultOpts) {
		if (this.isTest()) {
			return
		}
		mongoose.connection.on('connecting', () => console.log('[Mongodb] connectiong ...'));
		mongoose.connection.on('connected', () => console.log('[Mongodb] connected'));
		mongoose.connection.on('open', () => console.log('[Mongodb] open'));
		mongoose.connection.on('disconnected', () => console.log('[Mongodb] disconnected'));
		mongoose.connection.on('reconnected', () => console.log('[Mongodb] reconnected'));
		mongoose.connection.on('disconnecting', () => console.log('[Mongodb] disconnecting ...'));
		mongoose.connection.on('close', () => console.log('[Mongodb] close'));

		await mongoose.connect(mongoURI, opts)
	}

	static async close() {
		if (this.isTest()) {
			return
		}
		await mongoose.disconnect()
	}
}


export { MongoDBAdapter }
