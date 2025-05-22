import { z } from "zod";

const BrokerMessageDTO = z.object({
	content: z.record(z.string(), z.any()),
	properties: z.object({
		headers: z.record(z.string(), z.any()),
	}),
})

type TBrokerMessageDTO = z.infer<typeof BrokerMessageDTO>

export {
	BrokerMessageDTO,
	TBrokerMessageDTO
}
