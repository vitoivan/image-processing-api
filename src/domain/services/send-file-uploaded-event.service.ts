import { envs } from "../../common/env"
import { MessageBrokerPort } from "../../common/message-broker/ports/message-broker.port"
import { ImageEntity } from "../entities/image.entity"

type SendFileUploadedEventServiceParams = {
	messageBroker: MessageBrokerPort
	file: ImageEntity
}


async function sendFileUploadedEventService({ file, messageBroker }: SendFileUploadedEventServiceParams) {
	await messageBroker.sendToQueue(envs.RABBITMQ_QUEUE, {
		id: file.taskId,
	})
}


export { sendFileUploadedEventService }
