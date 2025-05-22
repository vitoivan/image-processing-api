import amqp from 'amqplib/callback_api';
import { MessageBrokerPort } from '../ports/message-broker.port';
import { envs } from '../../env';
import { NodeEnv } from '../../enums/nodeEnv';
import { TBrokerMessageDTO } from '../dtos/broker-message.dto';
import { Logger } from '../../utils/logger';

type RabbitMQAdapterConfig = {
	uri: string,
	exchange: string
	queue: string
}


class RabbitMQAdapter implements MessageBrokerPort {
	private static conn: amqp.Connection | null = null;
	private static channel: amqp.Channel | null = null;
	private static logger = new Logger("RabbitMQAdapter")

	private static isTest() {
		return envs.NODE_ENV === NodeEnv.TEST
	}

	private static createConnection(uri: string) {
		return new Promise<amqp.Connection>((resolve, reject) => {
			amqp.connect(uri, (error, connection) => {
				if (error) {
					reject(error);
				} else {
					resolve(connection);
				}
			});
		})
	}

	private static createChannel(connection: amqp.Connection) {
		return new Promise<amqp.Channel>((resolve, reject) => {
			connection.createChannel((error, channel) => {
				if (error) {
					reject(error);
				} else {
					resolve(channel);
				}
			})
		})
	}

	static async init(config: RabbitMQAdapterConfig): Promise<void> {
		if (this.isTest()) {
			return
		}
		if (RabbitMQAdapter.conn && RabbitMQAdapter.channel) {
			return;
		}
		this.logger.log("Initializing RabbitMQ ...")
		if (!config) {
			throw new Error("RabbitMQ config not found")
		}

		const connection = await this.createConnection(config.uri)
		const channel = await this.createChannel(connection)

		channel.assertExchange(config.exchange, "direct", { durable: true });
		channel.assertQueue(config.queue, { durable: true });

		RabbitMQAdapter.conn = connection;
		RabbitMQAdapter.channel = channel;

		this.logger.log("RabbitMQ initialized")
	}

	private getChannel() {
		if (!RabbitMQAdapter.conn || !RabbitMQAdapter.channel) {
			throw new Error("RabbitMQ not initialized")
		}
		return RabbitMQAdapter.channel
	}

	async sendToQueue(queue: string, data: any): Promise<void> {
		if (RabbitMQAdapter.isTest()) {
			return
		}
		const chann = this.getChannel()

		const message = RabbitMQAdapter.appendRetryField(
			{ data },
			RabbitMQAdapter.getRetryCount(data)
		)

		chann.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
	}

	static appendRetryField<T>(data: T = {} as T, retries: any): T & { retries: number } {
		const dataWithRetries: T & { retries: number } = { ...data, retries: 0 }

		let retriesCount = Number(retries || 0)
		if (isNaN(retriesCount)) {
			retriesCount = 0
		}

		dataWithRetries.retries = retriesCount
		return dataWithRetries
	}

	static getRetryCount(data: { retries?: number }) {
		if (!data) {
			return 0
		}
		const count = Number(data.retries || 0)
		if (isNaN(count)) {
			return 0
		}
		return count
	}

	listenToQueue(queue: string, callback: (message: TBrokerMessageDTO) => Promise<void>): void {
		if (RabbitMQAdapter.isTest()) {
			return
		}

		const chann = this.getChannel()

		function handleMessage(msg: amqp.Message | null) {


			function parseContent(content: Buffer) {
				try {
					return JSON.parse(content.toString() || '{}') as { data: Record<string, any>, retries: number }
				} catch (err) {
					RabbitMQAdapter.logger.error(`Error parsing message: ${(err as Error).message}`)
					throw err
				}
			}


			if (!msg) {
				RabbitMQAdapter.logger.error("Message not found")
				return
			}

			const { content, properties } = msg

			let parsedContent: ReturnType<typeof parseContent>
			try {

				parsedContent = parseContent(content)

				if (Object.keys(parsedContent).length === 0) {
					RabbitMQAdapter.logger.error("Message content is empty")
					return chann.ack(msg)
				}

				if (RabbitMQAdapter.getRetryCount(parsedContent) >= envs.RABBITMQ_RETRIES_TRESHOLD) {
					RabbitMQAdapter.logger.error("Message retries threshold exceeded")
					/* TODO: send to a dead letter queue
					 * im doing this because i want to keep the queue clean for test purposes,
					 * and its faster than setting up a dead letter queue
					*/
					return chann.ack(msg)
				}
			} catch (err) {
				RabbitMQAdapter.logger.error(`Error parsing message: ${(err as Error).message}`)
				/* TODO: send to a dead letter queue
				 * im doing this because i want to keep the queue clean for test purposes,
				 * and its faster than setting up a dead letter queue
				*/
				return chann.ack(msg)
			}



			callback({
				content: parsedContent,
				properties: {
					headers: properties.headers || {}
				}
			}).then(() => {
				RabbitMQAdapter.logger.log("Message processed successfully")
				chann.ack(msg)
			}).catch((err) => {
				RabbitMQAdapter.logger.error(`Error processing message: ${(err as Error).message}`)

				const newContent = RabbitMQAdapter.appendRetryField(
					parsedContent,
					RabbitMQAdapter.getRetryCount(parsedContent) + 1
				)

				try {
					if (!chann.sendToQueue(queue, Buffer.from(JSON.stringify(newContent)))) {
						throw new Error("Error while requeuing  message to queue")
					}
					return chann.ack(msg)
				} catch (err) {
					RabbitMQAdapter.logger.error(`Error requeuing message: ${(err as Error).message}`)
					return chann.nack(msg)
				}

			})
		}
		chann.consume(queue, handleMessage, { noAck: false })

	}
}

export { RabbitMQAdapter }
