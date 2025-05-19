import amqp from 'amqplib/callback_api';
import { MessageBrokerPort } from '../ports/message-broker.port';

type RabbitMQAdapterConfig = {
	uri: string,
	queue?: string
}

class RabbitMQAdapter implements MessageBrokerPort {
	private static conn: amqp.Connection | null = null;
	private static channel: amqp.Channel | null = null;

	static async init(config: RabbitMQAdapterConfig): Promise<void> {
		if (RabbitMQAdapter.conn && RabbitMQAdapter.channel) {
			return;
		}
		console.log("Initializing RabbitMQ ...")
		if (!config) {
			throw new Error("RabbitMQ config not found")
		}
		const connection = await (new Promise<amqp.Connection>((resolve, reject) => {
			amqp.connect(config!.uri, (error, connection) => {
				if (error) {
					reject(error);
				} else {
					resolve(connection);
				}
			});
		}));

		const channel = await (new Promise<amqp.Channel>((resolve, reject) => {
			connection.createChannel((error, channel) => {
				if (error) {
					reject(error);
				} else {
					resolve(channel);
				}
			})
		}));

		if (config.queue) {
			channel.assertQueue(config.queue, { durable: true });
		}

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
		const chann = this.getChannel()
		chann.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
	}
}

export { RabbitMQAdapter }
