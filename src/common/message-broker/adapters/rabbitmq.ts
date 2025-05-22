import amqp from 'amqplib/callback_api';
import { MessageBrokerPort } from '../ports/message-broker.port';
import { envs } from '../../env';
import { NodeEnv } from '../../enums/nodeEnv';
import { TBrokerMessageDTO } from '../dtos/broker-message.dto';
import { parse } from 'path';

type RabbitMQAdapterConfig = {
	uri: string,
	exchange: string
	queue: string
}


class RabbitMQAdapter implements MessageBrokerPort {
	private static conn: amqp.Connection | null = null;
	private static channel: amqp.Channel | null = null;

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
		console.log("Initializing RabbitMQ ...")
		if (!config) {
			throw new Error("RabbitMQ config not found")
		}

		const connection = await this.createConnection(config.uri)
		const channel = await this.createChannel(connection)

		channel.assertExchange(config.exchange, "direct", { durable: true });
		channel.assertQueue(config.queue, { durable: true });

		RabbitMQAdapter.conn = connection;
		RabbitMQAdapter.channel = channel;

		console.log("RabbitMQ initialized")
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
		chann.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
	}

	listenToQueue(queue: string, callback: (message: TBrokerMessageDTO) => Promise<void>): void {
		if (RabbitMQAdapter.isTest()) {
			return
		}

		const chann = this.getChannel()

		function handleMessage(msg: amqp.Message | null) {
			if (!msg) {
				console.error("Message not found")
				return
			}
			try {
				const { content, properties } = msg
				const parsedContent = JSON.parse(content.toString() || '{}')
				if (Object.keys(parsedContent).length === 0) {
					console.error("Message content is empty")
					return
				}
				callback({
					content: parsedContent as Record<string, any>,
					properties: {
						headers: properties.headers || {}
					}
				}).then(() => {
					chann.ack(msg)
				})
			} catch (err) {
				chann.nack(msg)
			}
		}
		chann.consume(queue, handleMessage, { noAck: false })

	}
}

export { RabbitMQAdapter }
