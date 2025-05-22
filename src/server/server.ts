import "dotenv/config"
import express from "express"
import { registerRoutes } from "./routes"
import { registerMiddlewares } from "./middlewares"
import { envs } from "../common/env"
import { RabbitMQAdapter } from "../common/message-broker/adapters/rabbitmq"
import { MongoDBAdapter } from "../common/database/mongo"
import { createServer } from "http"
import { defaultLogger } from "../common/utils/logger"


function listenToUncaughtExceptions() {
	process.on("uncaughtException", (err) => {
		defaultLogger.error(`Uncaught Exception: ${err.message}`)
	})

	process.on("unhandledRejection", (reason) => {
		defaultLogger.error(`Uncaught Rejection: ${reason}`)
	})
}


async function init() {
	await MongoDBAdapter.init(envs.MONGO_URI)
	await RabbitMQAdapter.init({
		uri: envs.RABBITMQ_URI,
		queue: envs.RABBITMQ_QUEUE,
		exchange: envs.RABBITMQ_EXCHANGE
	})

	defaultLogger.log("Starting server ...")
	const app = express()

	registerMiddlewares(app)
	registerRoutes(app)
	const server = createServer(app)

	server.listen(envs.PORT, (err?: Error) => {
		if (err) {
			defaultLogger.error(`Error starting server: ${err.message}`)
			return
		}
		defaultLogger.log(`Application started at http://localhost:${envs.PORT}`)
	})
}

listenToUncaughtExceptions()
init()
