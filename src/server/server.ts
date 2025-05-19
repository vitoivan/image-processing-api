import "dotenv/config"
import express from "express"
import { registerRoutes } from "./routes"
import { registerMiddlewares } from "./middlewares"
import { envs } from "../common/env"
import { RabbitMQAdapter } from "../common/message-broker/adapters/rabbitmq"
import { MongoDBAdapter } from "../common/database/mongo"

async function init() {
	await MongoDBAdapter.init(envs.MONGO_URI)
	await RabbitMQAdapter.init({ uri: envs.RABBITMQ_URI, queue: envs.RABBITMQ_QUEUE })

	console.log("Starting server ...")
	const app = express()

	registerMiddlewares(app)
	registerRoutes(app)

	app.listen(envs.PORT, (err?: Error) => {
		if (err) {
			console.error(`Error starting server: ${err.message}`)
			return
		}
		console.log(`Application started at http://localhost:${envs.PORT}`)
	})
}


init()
