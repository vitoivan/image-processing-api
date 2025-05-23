const env = {
	NODE_ENV: "test",
	MONGO_URI: "mongodb://127.0.0.1:27017/trakto",
	RABBITMQ_URI: "amqp://admin:admin@127.0.0.1:5672",
	RABBITMQ_QUEUE: "images.process",
	RABBITMQ_EXCHANGE: "images",
}

process.env = { ...process.env, ...env }
