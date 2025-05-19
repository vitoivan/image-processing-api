import mongoose from "mongoose";

const defaultOpts: mongoose.ConnectOptions = {
	dbName: "trakto",
	minPoolSize: 5,
	maxPoolSize: 20,
	bufferCommands: false
}

class MongoDBAdapter {

	static async init(mongoURI: string, opts: mongoose.ConnectOptions = defaultOpts) {
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
		await mongoose.disconnect()
	}
}


export { MongoDBAdapter }
