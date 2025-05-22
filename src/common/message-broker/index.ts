import { NodeEnv } from "../enums/nodeEnv"
import { envs } from "../env"
import { RabbitMQAdapter } from "./adapters/rabbitmq"
import { MessageBrokerPort } from "./ports/message-broker.port"


function getImplementation(): MessageBrokerPort {

	if (envs.NODE_ENV === NodeEnv.TEST) {
		return new RabbitMQAdapter()
	}

	return new RabbitMQAdapter()
}

const messageBroker = getImplementation()

export { messageBroker }
