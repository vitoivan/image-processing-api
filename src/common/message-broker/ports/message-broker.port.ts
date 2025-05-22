import { TBrokerMessageDTO } from "../dtos/broker-message.dto"

export interface MessageBrokerPort {
	sendToQueue(queue: string, data: any): Promise<void>
	listenToQueue(queue: string, callback: (message: TBrokerMessageDTO) => Promise<void>): void
}
