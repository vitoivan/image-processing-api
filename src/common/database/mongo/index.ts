import mongoose from "mongoose";
import { envs } from "../../env";
import { NodeEnv } from "../../enums/nodeEnv";
import { Logger } from "../../utils/logger";

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

	private static logger = new Logger("MongoDBAdapter")

	static isTest() {
		return envs.NODE_ENV === NodeEnv.TEST
	}

	static async init(mongoURI: string, opts: mongoose.ConnectOptions = defaultOpts) {
		if (this.isTest()) {
			return
		}
		mongoose.connection.on('connecting', () => this.logger.log('connectiong ...'))
		mongoose.connection.on('connected', () => this.logger.log('connected'));
		mongoose.connection.on('open', () => this.logger.log('open'));
		mongoose.connection.on('disconnected', () => this.logger.log('disconnected'));
		mongoose.connection.on('reconnected', () => this.logger.log('reconnected'));
		mongoose.connection.on('disconnecting', () => this.logger.log('disconnecting ...'));
		mongoose.connection.on('close', () => this.logger.log('close'));

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
