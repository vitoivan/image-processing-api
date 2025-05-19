export interface MessageBrokerPort {
	sendToQueue(queue: string, data: any): Promise<void>
}
